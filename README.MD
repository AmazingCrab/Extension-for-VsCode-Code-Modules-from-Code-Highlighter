# Modules From Code Highlighter

<div align="center">

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Me-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/amazingcrab)

**Export your color-highlighted code into organized module folders.**

The perfect companion for [Code Highlighter](https://github.com/AmazingCrab/Extension-for-VsCode-Code-Highlighter) - transform your visual code organization into actual module structure.

[Features](#-features) • [Installation](#-getting-started) • [Usage](#-how-to-use) • [Support](#-support-the-project)

</div>

---

## 🎥 Demo

<div align="center">
  <a href="https://www.youtube.com/watch?v=9x2gAGhsvXQ">
    <img src="https://img.youtube.com/vi/9x2gAGhsvXQ/maxresdefault.jpg" alt="Modules From Code Highlighter Demo">
    <br>
    <img src="https://img.shields.io/badge/▶_WATCH_DEMO-FF0000?style=for-the-badge&logoColor=white" alt="Play Button">
  </a>
  
  *Click to watch the demo video*
</div>

## What Does This Extension Do?

After using [Code Highlighter](https://github.com/AmazingCrab/Extension-for-VsCode-Code-Highlighter) to mark different parts of your code with colors (like Model Layer, Service Layer, API Routes, etc.), this extension **exports those highlighted sections into separate folder structures**.

Each color/layer gets its own folder with the extracted code **preserving the original file structure and line positions** - making it easy to understand where each piece came from.

---

## Features

### Export by Architecture Layer
- **Multi-select export** - Choose multiple layers at once (Ctrl/Cmd+click)
- **One layer, one folder** - Each color exports to `exported_layer/<LayerName>/`
- **Preserves file structure** - Maintains your original directory hierarchy
- **Positional accuracy** - Code stays in its original line positions with proper indentation

### Smart Code Extraction
- **Empty line preservation** - Non-highlighted lines remain empty to show context
- **Character-level precision** - Respects exact start/end positions of highlights
- **Multi-range support** - Handles multiple highlights in the same file
- **Automatic cleanup** - Overwrites previous exports to keep folders fresh

### Integration with Code Highlighter
- **Reads highlights.json** - Works automatically with Code Highlighter's save format
- **Metadata support** - Uses color names and descriptions from your highlights
- **Workspace-aware** - Finds highlights.json in your workspace root automatically

---

## Getting Started

### Prerequisites

You **must** have [Code Highlighter](https://github.com/AmazingCrab/Extension-for-VsCode-Code-Highlighter) installed and have highlighted some code first.

### Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for **"Modules From Highlighter Code"**
4. Click **Install**
5. Make sure you have a `highlights.json` file in your workspace

### Quick Start

1. **Highlight your code** using Code Highlighter (mark different layers/modules with colors)
2. **Right-click** anywhere in your editor
3. Select **"Export Modules from Color"**
4. **Choose one or more layers** to export (Ctrl/Cmd+click for multiple)
5. Press **Enter** to confirm
6. **Check the output** in `exported_layer/<LayerName>/` folders

---

## How to Use

### Basic Workflow

```
1. Use Code Highlighter to mark code sections
   ├─ Model Layer (blue)
   ├─ Service Layer (orange)
   └─ API Routes (cyan)

2. Right-click → "Export Modules from Color"

3. Select layers to export:
   ☑ Model Layer
   ☑ Service Layer
   ☐ API Routes

4. Result:
   exported_layer/
   ├── Model_Layer/
   │   ├── src/models/user.js
   │   └── src/models/product.js
   └── Service_Layer/
       ├── src/services/auth.js
       └── src/services/payment.js
```

### Multi-Select Export

You can export **multiple layers at once**:

1. Right-click → "Export Modules from Color"
2. **Ctrl+click** (Windows/Linux) or **Cmd+click** (Mac) to select multiple layers
3. Press **Enter**
4. Each layer will be exported to its own folder

### What Gets Exported?

**Example Input** (`src/auth/login.js`):
```javascript
// Line 1: import express from 'express';
// Line 2: import jwt from 'jsonwebtoken';
// Line 3:
// Line 4: function validateUser(email, password) {  // ← Highlighted (lines 4-8)
// Line 5:   const user = findUser(email);           // ← Highlighted
// Line 6:   return bcrypt.compare(password, user);  // ← Highlighted
// Line 7: }                                          // ← Highlighted
// Line 8:
// Line 9: export default validateUser;
```

**Example Output** (`exported_layer/Authentication/src/auth/login.js`):
```javascript



function validateUser(email, password) {
  const user = findUser(email);
  return bcrypt.compare(password, user);
}

```

Notice how:
- Lines 1-3 are empty (not highlighted)
- Lines 4-7 contain the highlighted code **in their original positions**
- Lines 8-9 are empty (not highlighted)
- **Indentation and character positions are preserved**

---

## Example Use Cases

### Refactoring Monolith to Microservices
1. Highlight different service boundaries with colors
2. Export each service layer separately
3. Use exported code as foundation for new microservices

### Extracting Shared Libraries
1. Highlight utility functions and helpers
2. Export to see all utilities in one place
3. Create a shared package from exported code

### Code Documentation
1. Highlight specific architectural patterns
2. Export for educational purposes
3. Show team members what code belongs to each layer

### Architecture Analysis
1. Highlight by architectural layer (MVC, Clean Architecture)
2. Export to see code distribution
3. Identify overly large or small layers

---

## Output Structure

After export, you'll find:

```
your-workspace/
├── src/
│   ├── models/
│   ├── services/
│   └── controllers/
├── highlights.json           ← Generated by Code Highlighter
└── exported_layer/           ← Generated by this extension
    ├── Model_Layer/
    │   └── src/
    │       └── models/
    │           ├── user.js   ← Only highlighted code from user.js
    │           └── product.js
    ├── Service_Layer/
    │   └── src/
    │       └── services/
    │           └── auth.js
    └── API_Routes/
        └── src/
            └── controllers/
                └── api.js
```

Each exported folder:
- **Mirrors your original structure**
- **Contains only highlighted code** for that layer
- **Preserves line numbers** and indentation
- **Can be committed to Git** for team collaboration

---

## Requirements

- **VS Code version**: 1.60.0 or higher
- **Code Highlighter extension** must be installed
- **highlights.json** must exist in workspace root
- **Workspace/folder** must be open (not single files)

---

## Commands

Access via **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `Export Modules from Color` | Open layer selection and export |

### Context Menu
- **Right-click** in editor → "Export Modules from Color"

---

## Keyboard Shortcuts

Add custom keybindings in your `keybindings.json`:

```json
[
  {
    "key": "ctrl+alt+e",
    "command": "highlight-modules-viewer.showColorPicker"
  }
]
```

---

## How It Works

### 1. Reading highlights.json

The extension reads the `highlights.json` file created by Code Highlighter:

```json
{
  "files": {
    "src/auth/login.js": {
      "#3B82F650": [
        {
          "startLine": 4,
          "startCharacter": 0,
          "endLine": 7,
          "endCharacter": 1,
          "name": "Authentication",
          "description": "Auth logic, JWT, sessions"
        }
      ]
    }
  }
}
```

### 2. Processing Each File

For each file with highlights:
1. Creates an array matching the original file's line count
2. Fills in only the lines that are highlighted
3. Preserves exact character positions and indentation
4. Leaves non-highlighted lines empty

### 3. Creating Output Structure

1. Creates `exported_layer/<LayerName>/` folder
2. Recreates the original directory structure inside
3. Writes files with extracted code
4. **Overwrites** previous exports (always fresh)

---

## Known Issues

- **Large files**: Files with 10,000+ lines may take a few seconds to process
- **Overlapping highlights**: If multiple colors overlap on the same lines, later colors may overwrite earlier ones in exports
- **Memory**: Very large workspaces (1000+ files) may require extra memory
- **Line shifts**: If you edit code after highlighting but before exporting, line positions may be incorrect

---

## Troubleshooting

### "No highlights.json file found"
- Make sure Code Highlighter is installed
- Highlight some code first (it creates the file)
- Check your workspace root folder

### "No highlight colors found"
- Use Code Highlighter to add some highlights
- Make sure the highlights.json file isn't empty
- Try reloading the window (`Ctrl+Shift+P` → "Reload Window")

### Exported code is in wrong position
- This happens if you edited the file after highlighting
- Re-highlight the sections with Code Highlighter
- Then export again

### Multiple layers export to same folder
- Each layer should get its own folder: `exported_layer/<LayerName>/`
- If they're merging, check that your layer names are different
- Special characters in layer names are replaced with underscores

---

## Related Extension

**[Code Highlighter](https://github.com/AmazingCrab/Extension-for-VsCode-Code-Highlighter)**  
The companion extension that creates the highlights this extension exports. You need both for the full workflow!

---

## Support the Project

If **Modules From Highlighter Code** helps your workflow, consider supporting its development:

<div align="center">

[![Ko-fi](https://img.shields.io/badge/☕_Buy_me_a_coffee-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/amazingcrab)
[![GitHub Sponsors](https://img.shields.io/badge/💝_Sponsor_on_GitHub-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/AmazingCrab)

</div>

### Other Ways to Support:
- ⭐ **Star both repositories** - Code Highlighter & Modules From Highlighter Code
- 🐛 **Report bugs** - Help make it better
- 💡 **Suggest features** - Share your workflow ideas
- 📢 **Share with your team** - Spread the workflow
- ✍️ **Write a review** - Share on VS Code Marketplace

Your support helps dedicate time to new features and improvements!

---

## Contributing

Found a bug or have a feature request?  
**Open an issue**: [Modules From Highlighter Code Issues](https://github.com/AmazingCrab/Extension-for-VsCode-Code-Modules-from-Code-Highlighter/issues)

Want to contribute code?
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Release Notes

### 1.0.0 (Initial Release)
- ✨ Multi-layer export with multi-select
- 📁 Preserves original file structure
- 📍 Positional code extraction with line preservation
- 🔄 Automatic export folder cleanup
- 🎨 Full integration with Code Highlighter
- 🚀 Fast processing for large codebases

---

## Contact

**Developer**: Emanuel Conte (AmazingCrab)  
**Email**: amazingcrab@proton.me
**Ko-fi**: [ko-fi.com/amazingcrab](https://ko-fi.com/amazingcrab)

Questions about the workflow or want to collaborate? Reach out!

---

## Links

- **Repository**: [github.com/AmazingCrab/Extension-for-VsCode.Modules-from-Highlighter-code](https://github.com/AmazingCrab/Extension-for-VsCode-Code-Modules-from-Code-Highlighter)
- **Code Highlighter**: [github.com/AmazingCrab/Extension-for-VsCode-Code-Highlighter](https://github.com/AmazingCrab/Extension-for-VsCode-Code-Highlighter)
- **Report Issues**: [GitHub Issues](https://github.com/AmazingCrab/Extension-for-VsCode-Code-Modules-from-Code-Highlighter/issues)
- **Support**: [Ko-fi](https://ko-fi.com/amazingcrab)

---

## License

This project is licensed under the **MIT License** - see the [LICENSE.md](LICENSE.md) file for details.

```
MIT License - Copyright (c) 2025 Emanuel Conte (AmazingCrab)
```

---

## Show Your Support

If this extension improves your workflow:
- ⭐ **Star the repositories** on GitHub (both extensions!)
- ☕ **[Buy me a coffee](https://ko-fi.com/amazingcrab)** on Ko-fi
- 📝 **Leave a review** on VS Code Marketplace
- 🐛 **Report bugs** or suggest features
- 📢 **Share** the full workflow with your team!

---

<div align="center">

**Made with ❤️ by [Emanuel Conte (AmazingCrab)](https://github.com/AmazingCrab)**

*Transform your visual code organization into modular architecture!*

**Complete Workflow**: Code Highlighter → Modules From Highlighter Code → Organized Modules

</div>