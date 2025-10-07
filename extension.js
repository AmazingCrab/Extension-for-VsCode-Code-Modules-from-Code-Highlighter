const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * Activates the extension, registering commands and initializing functionality.
 * @param {vscode.ExtensionContext} context - The VS Code extension context.
 */
function activate(context) {
    console.log('Highlight Modules Viewer is active.');

    let disposable = vscode.commands.registerCommand('highlight-modules-viewer.showColorPicker', async () => {
        const highlightsFilePath = getHighlightsFilePath();

        if (!highlightsFilePath || !fs.existsSync(highlightsFilePath)) {
            vscode.window.showWarningMessage('No highlights.json file found in the project root.');
            return;
        }

        try {
            const usedColors = getUsedColorsFromFile(highlightsFilePath);

            if (usedColors.length === 0) {
                vscode.window.showInformationMessage('No highlight colors found in highlights.json.');
                return;
            }

            // Create items for the quick pick menu
            const colorItems = usedColors.map(color => ({
                label: `$(symbol-color) ${color.name}`,
                description: color.value,
                detail: `Export highlighted code for the layer: ${color.name}`,
                colorValue: color.value,
                colorName: color.name
            }));

            // Show the quick pick menu with multi-select enabled
            const selectedColors = await vscode.window.showQuickPick(colorItems, {
                placeHolder: 'Select layers to export (Ctrl+click or Cmd+click for multiple, Enter to confirm)',
                matchOnDescription: true,
                matchOnDetail: true,
                canPickMany: true
            });

            if (!selectedColors || selectedColors.length === 0) {
                vscode.window.showInformationMessage('No layers selected for export.');
                return;
            }

            console.log(`Selected layers: ${selectedColors.map(c => c.colorName).join(', ')}`);

            // Get current timestamp in YYYYMMDD_HHMM format
            const timestamp = getCurrentTimestamp();

            // Check if single folder export is enabled or user confirms it
            let exportToSingleFolder = false;
            let exportFolderName = null;

            if (selectedColors.length > 1) {
                const config = vscode.workspace.getConfiguration('highlightModulesViewer');
                exportToSingleFolder = config.get('exportToSingleFolder', false);

                // If multiple layers are selected, ask for confirmation to export to a single folder
                if (!exportToSingleFolder) {
                    const confirmationItems = [
                        {
                            label: '$(check) Export all layers to a single folder',
                            description: `All code will be exported to exported_layer/selected_layers_${timestamp}`,
                            picked: false
                        },
                        {
                            label: 'Export to separate folders',
                            description: `Each layer will be exported to its own folder (e.g., layer_name_${timestamp})`,
                            picked: true
                        }
                    ];

                    const confirmation = await vscode.window.showQuickPick(confirmationItems, {
                        placeHolder: 'Choose export folder structure for multiple layers',
                        canPickMany: false
                    });

                    if (confirmation && confirmation.label.includes('single folder')) {
                        exportToSingleFolder = true;
                    }
                }

                if (exportToSingleFolder) {
                    exportFolderName = `selected_layers_${timestamp}`;
                }
            }

            // Export each selected layer and track exported files and module data
            let totalExported = 0;
            const exportedFiles = new Map(); // Track files to avoid overwrites in single folder mode
            const moduleData = []; // Track module data for modules.json

            for (const selectedColor of selectedColors) {
                const exportedCount = await exportCodeForColor(
                    selectedColor.colorValue,
                    selectedColor.colorName,
                    highlightsFilePath,
                    exportFolderName || `${selectedColor.colorName.replace(/\s/g, '_')}_${timestamp}`,
                    exportedFiles,
                    exportToSingleFolder,
                    moduleData
                );
                totalExported += exportedCount;
                const exportPath = exportFolderName || `${selectedColor.colorName.replace(/\s/g, '_')}_${timestamp}`;
                vscode.window.showInformationMessage(`Exported ${exportedCount} snippet(s) for layer ${selectedColor.colorName} to: exported_layer/${exportPath}`);
            }

            // Export modules and colors to modules.json
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const config = vscode.workspace.getConfiguration('highlightModulesViewer');
            const exportPath = config.get('exportPath', 'exported_layer');
            const colorsData = selectedColors.map(c => ({
                name: c.colorName,
                value: c.colorValue
            }));

            if (exportToSingleFolder) {
                // Write single modules.json for all layers in the single folder
                const exportRoot = path.join(workspaceRoot, exportPath, exportFolderName);
                const modulesFilePath = path.join(exportRoot, 'modules.json');
                fs.writeFileSync(modulesFilePath, JSON.stringify({ modules: moduleData, colors: colorsData }, null, 2), 'utf8');
            } else {
                // Write modules.json for each layer's folder
                for (const selectedColor of selectedColors) {
                    const exportRoot = path.join(workspaceRoot, exportPath, `${selectedColor.colorName.replace(/\s/g, '_')}_${timestamp}`);
                    const modulesFilePath = path.join(exportRoot, 'modules.json');
                    const layerModules = moduleData.filter(module => module.layerName === selectedColor.colorName);
                    fs.writeFileSync(modulesFilePath, JSON.stringify({
                        modules: layerModules,
                        colors: [{ name: selectedColor.colorName, value: selectedColor.colorValue }]
                    }, null, 2), 'utf8');
                }
            }

            if (totalExported === 0) {
                vscode.window.showInformationMessage('No code found to export for the selected layers.');
            } else {
                vscode.window.showInformationMessage(`Exported a total of ${totalExported} snippet(s) for ${selectedColors.length} layer(s) with modules.json.`);
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Error reading or processing highlights.json: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

/**
 * Retrieves the path to the highlights.json file in the workspace.
 * @returns {string|null} - Path to highlights.json or null if no workspace is open.
 */
function getHighlightsFilePath() {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        return path.join(workspaceRoot, 'highlights.json');
    }
    return null;
}

/**
 * Reads highlights.json and extracts a unique list of used colors.
 * Reads highlights.json in read-only mode to ensure it is not modified.
 * @param {string} filePath - Path to highlights.json.
 * @returns {{name: string, value: string}[]} - Array of unique color objects.
 */
function getUsedColorsFromFile(filePath) {
    // Read-only access to highlights.json
    const jsonContent = fs.readFileSync(filePath, 'utf8');
    const savedHighlights = JSON.parse(jsonContent);

    // Use a Map to ensure unique colors
    const uniqueColors = new Map();

    if (savedHighlights.files) {
        Object.values(savedHighlights.files).forEach(fileData => {
            Object.keys(fileData).forEach(colorValue => {
                const colorInfos = fileData[colorValue]; // This is an array
                if (colorInfos.length > 0 && colorInfos[0].name && !uniqueColors.has(colorValue)) {
                    uniqueColors.set(colorValue, {
                        name: colorInfos[0].name, // Assume all items in the array have the same name for this color
                        value: colorValue
                    });
                }
            });
        });
    }

    return Array.from(uniqueColors.values());
}

/**
 * Generates a timestamp in YYYYMMDD_HHMM format.
 * @returns {string} - Timestamp string.
 */
function getCurrentTimestamp() {
    const now = new Date();
    now.setHours(now.getHours() - 3); // Adjust for -03 timezone
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
}

/**
 * Exports highlighted code for a specific color (layer) to a folder structure.
 * Creates exported_layer/<layer_name or single_folder>_<timestamp>/<original_file_path> with highlighted code
 * in its original position, preserving line and character offsets.
 * Non-highlighted lines are left empty to maintain structure.
 * Reads highlights.json in read-only mode to ensure it is not modified.
 * @param {string} colorValue - The hex value of the selected color.
 * @param {string} colorName - The name of the layer.
 * @param {string} highlightsFilePath - Path to highlights.json.
 * @param {string} folderName - Name of the export folder (includes timestamp).
 * @param {Map} exportedFiles - Map to track exported files to prevent overwrites.
 * @param {boolean} exportToSingleFolder - Whether to export to a single folder.
 * @param {Array} moduleData - Array to store module data for modules.json.
 * @returns {number} - Number of snippets exported for this layer.
 */
async function exportCodeForColor(colorValue, colorName, highlightsFilePath, folderName, exportedFiles, exportToSingleFolder, moduleData) {
    // Read-only access to highlights.json
    const jsonContent = fs.readFileSync(highlightsFilePath, 'utf8');
    const savedHighlights = JSON.parse(jsonContent);
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const config = vscode.workspace.getConfiguration('highlightModulesViewer');
    const exportPath = config.get('exportPath', 'exported_layer');
    const exportRoot = path.join(workspaceRoot, exportPath, folderName);

    // Clean the export folder for this layer if it exists
    if (fs.existsSync(exportRoot)) {
        fs.rmSync(exportRoot, { recursive: true, force: true });
    }

    let exportedCount = 0;

    if (savedHighlights.files) {
        for (const [relativePath, fileData] of Object.entries(savedHighlights.files)) {
            const colorRanges = fileData[colorValue];
            if (colorRanges && colorRanges.length > 0) {
                const fullPath = path.join(workspaceRoot, relativePath);
                if (!fs.existsSync(fullPath)) {
                    console.warn(`File not found: ${fullPath}`);
                    continue;
                }

                const fileContent = fs.readFileSync(fullPath, 'utf8');
                const lines = fileContent.split('\n');
                // Initialize output lines with empty strings, matching original file line count
                let outputLines = new Array(lines.length).fill('');

                // In single folder mode, check if file was already processed
                let existingLines = null;
                if (exportToSingleFolder && exportedFiles.has(relativePath)) {
                    existingLines = exportedFiles.get(relativePath);
                    outputLines = existingLines.slice(); // Clone to avoid modifying the original
                }

                colorRanges.forEach(range => {
                    // Extract the snippet
                    const snippetLines = lines.slice(range.startLine, range.endLine + 1);
                    let snippet = snippetLines.join('\n');
                    // Adjust for partial lines if necessary
                    if (range.startCharacter > 0 || range.endCharacter < snippetLines[snippetLines.length - 1].length) {
                        snippet = snippet.substring(range.startCharacter, snippet.length - (snippetLines[snippetLines.length - 1].length - range.endCharacter));
                    }

                    // Add module data to the array
                    moduleData.push({
                        filePath: relativePath,
                        layerName: colorName,
                        colorValue: colorValue,
                        range: {
                            startLine: range.startLine,
                            endLine: range.endLine,
                            startCharacter: range.startCharacter,
                            endCharacter: range.endCharacter
                        }
                    });

                    // Split snippet into lines for accurate placement
                    const snippetLinesSplit = snippet.split('\n');
                    for (let i = 0; i < snippetLinesSplit.length; i++) {
                        const lineIndex = range.startLine + i;
                        if (lineIndex < outputLines.length) {
                            // Add leading spaces to match startCharacter for the first line
                            const prefix = i === 0 ? ' '.repeat(range.startCharacter) : '';
                            // Only overwrite if the line is empty or we're not in single folder mode
                            if (!exportToSingleFolder || !outputLines[lineIndex]) {
                                outputLines[lineIndex] = prefix + snippetLinesSplit[i];
                            }
                        }
                    }
                    exportedCount++;
                });

                if (exportedCount > 0) {
                    // Update the exportedFiles map in single folder mode
                    if (exportToSingleFolder) {
                        exportedFiles.set(relativePath, outputLines);
                    }

                    // Create the directory structure
                    const exportFilePath = path.join(exportRoot, relativePath);
                    const exportDir = path.dirname(exportFilePath);
                    fs.mkdirSync(exportDir, { recursive: true });

                    // Write the output, joining lines with newlines
                    const exportContent = outputLines.join('\n');
                    fs.writeFileSync(exportFilePath, exportContent, 'utf8');
                }
            }
        }
    }

    return exportedCount;
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};