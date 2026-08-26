# ⚡ EV — AI-Powered Desktop Assistant

<div align="center">

![Electron](https://img.shields.io/badge/Electron-43.4.1-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.2.6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-0.6.3-black?style=for-the-badge&logo=ollama&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

<p align="center">
  A futuristic, HUD-style intelligent desktop assistant built with <b>Electron</b>, <b>React 19</b>, <b>Vite</b>, and <b>Tailwind CSS</b>. EV monitors system vitals in real-time, interprets natural language commands, controls window states, and integrates with local AI models.
</p>

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗 Architecture & Flow](#-architecture--flow)
- [📁 Folder Structure](#-folder-structure)
- [⚙️ Prerequisites & System Requirements](#️-prerequisites--system-requirements)
- [🚀 Quick Start / Setup Guide](#-quick-start--setup-guide)
- [📦 Detailed Package Breakdown & Installation](#-detailed-package-breakdown--installation)
  - [Production Dependencies (`dependencies`)](#production-dependencies-dependencies)
  - [Development Dependencies (`devDependencies`)](#development-dependencies-devdependencies)
- [🛠 Available NPM Scripts](#-available-npm-scripts)
- [🔌 IPC & System Integration](#-ipc--system-integration)
- [🧠 Brain & Intent Engine](#-brain--intent-engine)
- [🧰 Native Module Compilation (better-sqlite3)](#-native-module-compilation-better-sqlite3)
- [🤖 Optional: Setting up Ollama for Local AI](#-optional-setting-up-ollama-for-local-ai)
- [🔧 Recommended IDE & Extensions](#-recommended-ide--extensions)
- [❓ Troubleshooting & FAQ](#-troubleshooting--faq)

---

## ✨ Features

- **Futuristic HUD UI**: Transparent, frameless glowing orb interface with smooth animations powered by Framer Motion.
- **Real-Time Hardware Diagnostics**:
  - 🖥️ **CPU**: Model, clock speed, core counts, real-time load/usage.
  - 💾 **Memory**: Total, used, free RAM with active utilization percentages.
  - 🔋 **Battery**: Battery level, charging state, remaining runtime.
  - ⚡ **Processes**: Running process list with PID, CPU/RAM consumption, and status.
  - 🎮 **GPU & Network**: Graphics controllers and active network interfaces.
- **Natural Language Intent Parsing**: Rule-based & AI-ready intent parser (`src/main/brain/`).
- **Local AI Readiness**: Integrated Ollama client for privacy-first, on-device intelligence.
- **Local Embedded Storage**: High-performance SQLite database via `better-sqlite3`.
- **Cross-Platform Tooling**: Built-in file system tools, browser automations, terminal execution hooks, and app controllers.
- **Modular Electron Architecture**: Strict separation of Main Process, Preload Script (Context Isolation), and React Renderer.

---

## 🏗 Architecture & Flow

```
┌───────────────────────────────────────────────────────────┐
│                    REACT RENDERER                         │
│   (App.jsx, HUD Orb, Response Cards, Controls, Chat)      │
└─────────────────────────────┬─────────────────────────────┘
                              │ window.ev / window.system
                              ▼
┌───────────────────────────────────────────────────────────┐
│                    PRELOAD BRIDGE                         │
│         (contextBridge, ipcRenderer.invoke / send)        │
└─────────────────────────────┬─────────────────────────────┘
                              │ IPC Channels (ev:command, ev:system:stats, ...)
                              ▼
┌───────────────────────────────────────────────────────────┐
│                    MAIN PROCESS                           │
│  ┌─────────────────┬───────────────────┬───────────────┐  │
│  │  Brain / Intent │ System Monitor    │ Tools & Exec  │  │
│  │  (Ollama / NLU) │ (systeminformation)│ (FS, Browser) │  │
│  └─────────────────┴───────────────────┴───────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │               better-sqlite3 Database               │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

Below is the complete project directory structure for initial setup:

```
EV/
├── .editorconfig                # Coding style rules across editors
├── .gitignore                   # Files and directories ignored by Git
├── .prettierignore              # Files ignored by Prettier formatter
├── .prettierrc.yaml             # Prettier code formatting rules
├── .vscode/                     # VSCode recommended workspace settings
├── build/                       # Build assets and icons for packaging
│   ├── entitlements.mac.plist   # macOS security entitlements & permissions
│   ├── icon.icns                # macOS application icon
│   ├── icon.ico                 # Windows application icon
│   └── icon.png                 # Application logo (PNG format)
├── electron-builder.yml         # electron-builder packaging configurations
├── electron.vite.config.mjs     # Electron-Vite multi-target build configuration
├── eslint.config.mjs            # Flat ESLint configuration file
├── package.json                 # Project manifest, dependencies, and scripts
├── package-lock.json            # Lockfile for exact dependency versions
├── README.md                    # Project documentation
├── resources/                   # Runtime resources (icons, static assets)
│   └── icon.png                 # Main window icon
└── src/                         # Application source code
    ├── main/                    # Electron Main Process (Node.js backend)
    │   ├── ai/                  # AI integrations
    │   │   ├── agent.js         # AI agent controller & workflow logic
    │   │   ├── ollama.js        # Ollama local LLM client wrapper
    │   │   └── prompt.js        # System prompts and instruction templates
    │   ├── brain/               # Command processing & Intent detection
    │   │   ├── index.js         # Brain pipeline entry point
    │   │   └── intent.js        # Intent classification rules & heuristics
    │   ├── database/            # SQLite storage layer
    │   │   ├── db.js            # better-sqlite3 database initialization
    │   │   ├── queries.js       # Prepared SQL queries and handlers
    │   │   └── schema.js        # Database table schemas and migrations
    │   ├── index.js             # Main Electron entry point & IPC handlers
    │   ├── security/            # Security policies & permissions
    │   │   ├── command-policy.js# Command execution safety rules
    │   │   └── permissions.js   # Permission gates for system actions
    │   ├── system/              # Hardware and OS diagnostics
    │   │   ├── battery.js       # Battery status and power metrics
    │   │   ├── cpu.js           # CPU usage, load, cores, and speed
    │   │   ├── gpu.js           # GPU controller and display info
    │   │   ├── index.js         # Unified system stats aggregator
    │   │   ├── memory.js        # RAM capacity, used, and free stats
    │   │   ├── network.js       # Network interfaces and latency stats
    │   │   └── processes.js     # Running process list and metrics
    │   └── tools/               # Executable system tools
    │       ├── applications/    # App opening/closing helpers
    │       │   ├── close.js
    │       │   └── open.js
    │       ├── browser/         # Web search and URL openers
    │       │   └── browser.js
    │       ├── filesystem/      # File reading, writing, and search
    │       │   ├── read.js
    │       │   ├── search.js
    │       │   └── write.js
    │       ├── index.js         # Unified tool registry
    │       └── terminal/        # Terminal command executor
    │           └── execute.js
    ├── preload/                 # Electron Preload Scripts (Secure IPC Bridge)
    │   └── index.js             # Exposes window.ev, window.system, window.electron
    └── renderer/                # React 19 Frontend (User Interface)
        ├── index.html           # HTML template for Vite
        └── src/                 # React source files
            ├── App.jsx          # Main HUD view, command form, and state
            ├── main.jsx         # React DOM mount point
            ├── assets/          # SVG icons and visual assets
            │   ├── base.css
            │   ├── electron.svg
            │   ├── main.css
            │   └── wavy-lines.svg
            ├── components/      # UI components
            │   └── responses/   # Response cards for system diagnostics
            │       ├── BatteryCard.jsx
            │       ├── CpuCard.jsx
            │       ├── MemoryCard.jsx
            │       ├── ProcessCard.jsx
            │       ├── ResponseRenderer.jsx
            │       └── TextCard.jsx
            ├── pages/           # Application views/screens
            │   ├── Chat.jsx
            │   ├── Home.jsx
            │   ├── Settings.jsx
            │   └── System.jsx
            ├── response/        # Response formatters
            │   └── responseManager.js
            └── styles/          # Global styles & animations
                └── index.css    # HUD glowing styles, animations & themes
```

---

## ⚙️ Prerequisites & System Requirements

Before setting up the project, ensure your workstation meets the following requirements:

1. **Node.js**: `v18.0.0` or higher (`v20.x` LTS or `v22.x` recommended).
   - Check version:
     ```bash
     node -v
     ```
2. **NPM**: `v9.0.0` or higher (bundled with Node.js).
   - Check version:
     ```bash
     npm -v
     ```
3. **C++ Build Tools (Required for compiling `better-sqlite3`)**:
   - **Windows**: Install Visual Studio C++ Build Tools or run PowerShell as Administrator:
     ```powershell
     npm install --global --production windows-build-tools
     ```
   - **macOS**: Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```
   - **Linux (Ubuntu/Debian)**: Install standard compilation tools:
     ```bash
     sudo apt-get update
     sudo apt-get install -y build-essential python3
     ```
4. **Ollama (Optional - for local LLM inference)**:
   - Download & install from [ollama.com](https://ollama.com).

---

## 🚀 Quick Start / Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/EV.git
cd EV
```

### 2. Install All Dependencies

Run `npm install` to download and install all production and development packages:

```bash
npm install
```

> **Note**: The `postinstall` script (`electron-builder install-app-deps`) runs automatically to rebuild native C++ modules (such as `better-sqlite3`) against Electron's Node headers.

### 3. Rebuild Native Modules (If Needed Manually)

If you encounter native binary mismatch errors during startup, run:

```bash
npm run postinstall
```

### 4. Start in Development Mode

Launch the app with hot module reloading (HMR) for both Electron and React:

```bash
npm run dev
```

The frameless floating HUD window will appear on your desktop with DevTools opened in a detached window.

---

## 📦 Detailed Package Breakdown & Installation

If you are recreating the project from scratch or installing packages individually, here is the complete breakdown of every package, its purpose, and the exact install commands:

### Production Dependencies (`dependencies`)

These runtime packages are bundled into the final application build:

| Package                         | Version   | Purpose & Usage in EV                                                                       |
| :------------------------------ | :-------- | :------------------------------------------------------------------------------------------ |
| **`@electron-toolkit/preload`** | `^3.0.2`  | Context bridge helpers to expose safe APIs from preload scripts to the renderer.            |
| **`@electron-toolkit/utils`**   | `^4.0.0`  | Utilities for window shortcut management, platform checks, and app lifecycle.               |
| **`@tailwindcss/vite`**         | `^4.3.3`  | Vite plugin integration for Tailwind CSS v4.                                                |
| **`tailwindcss`**               | `^4.3.3`  | Next-generation utility-first styling engine used for HUD and dashboard design.             |
| **`better-sqlite3`**            | `^13.0.3` | Fastest synchronous SQLite3 client for local chat history, state persistence, and settings. |
| **`framer-motion`**             | `^13.1.1` | Production-ready motion and gesture library for floating card animations and HUD effects.   |
| **`lucide-react`**              | `^1.34.0` | Clean, customizable icon set for hardware status, navigation, and controls.                 |
| **`ollama`**                    | `^0.6.3`  | Official JavaScript client for interacting with local Ollama LLMs (e.g., Llama 3, Mistral). |
| **`systeminformation`**         | `^5.33.2` | System hardware profiling library (CPU load, RAM usage, battery levels, processes, GPU).    |

#### 📥 Single Command to Install All Production Dependencies:

```bash
npm install @electron-toolkit/preload @electron-toolkit/utils @tailwindcss/vite tailwindcss better-sqlite3 framer-motion lucide-react ollama systeminformation
```

---

### Development Dependencies (`devDependencies`)

These tools are only used during development, linting, formatting, and packaging:

| Package                                        | Version    | Purpose                                                                                        |
| :--------------------------------------------- | :--------- | :--------------------------------------------------------------------------------------------- |
| **`electron`**                                 | `^43.4.1`  | The cross-platform desktop application framework.                                              |
| **`electron-vite`**                            | `^5.0.0`   | Next-generation build tool and dev server tailored for Electron + Vite.                        |
| **`vite`**                                     | `^7.2.6`   | Frontend bundler offering instantaneous HMR for the React UI.                                  |
| **`react`**                                    | `^19.2.1`  | Core React 19 UI component library.                                                            |
| **`react-dom`**                                | `^19.2.1`  | React DOM renderer for desktop web views.                                                      |
| **`@vitejs/plugin-react`**                     | `^5.1.1`   | Fast Refresh and JSX transformation plugin for Vite.                                           |
| **`electron-builder`**                         | `^26.0.12` | Complete packaging solution for generating `.exe`, `.dmg`, `.AppImage`, and `.deb` installers. |
| **`eslint`**                                   | `^9.39.1`  | Pluggable JavaScript linter.                                                                   |
| **`eslint-plugin-react`**                      | `^7.37.5`  | React specific linting rules.                                                                  |
| **`eslint-plugin-react-hooks`**                | `^7.0.1`   | ESLint rules for React Hooks correctness.                                                      |
| **`eslint-plugin-react-refresh`**              | `^0.4.24`  | Validates components for hot module reloading.                                                 |
| **`@electron-toolkit/eslint-config`**          | `^2.1.0`   | Standard ESLint shareable configurations for Electron.                                         |
| **`@electron-toolkit/eslint-config-prettier`** | `^3.0.0`   | Turns off conflicting ESLint formatting rules with Prettier.                                   |
| **`prettier`**                                 | `^3.7.4`   | Automated code formatting engine.                                                              |

#### 📥 Single Command to Install All Development Dependencies:

```bash
npm install -D electron electron-vite vite react react-dom @vitejs/plugin-react electron-builder eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh @electron-toolkit/eslint-config @electron-toolkit/eslint-config-prettier prettier
```

---

## 🛠 Available NPM Scripts

| Command                | Description                                                                                  |
| :--------------------- | :------------------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the Electron app in development mode with HMR for main, preload, and renderer.        |
| `npm run build`        | Builds and compiles all three targets (main, preload, renderer) into `./out`.                |
| `npm run start`        | Previews the compiled production build locally.                                              |
| `npm run postinstall`  | Rebuilds native Node.js addons (`better-sqlite3`) for the current Electron version.          |
| `npm run build:win`    | Builds the app and generates a Windows NSIS installer (`.exe`).                              |
| `npm run build:mac`    | Builds the app and generates macOS package (`.dmg`).                                         |
| `npm run build:linux`  | Builds the app for Linux (`.AppImage`, `.deb`, `.snap`).                                     |
| `npm run build:unpack` | Builds into an unpacked directory for fast executable testing without creating an installer. |
| `npm run lint`         | Runs ESLint across all source files to find syntax or style issues.                          |
| `npm run format`       | Runs Prettier to auto-format all code in the workspace.                                      |

---

## 🔌 IPC & System Integration

The application uses Electron's `contextBridge` to expose a secure API surface to the renderer window:

### Available APIs in Renderer (`window.ev` & `window.system`):

```javascript
// Check backend status
const status = await window.ev.getStatus()

// Send natural language or system command
const result = await window.ev.command('show me cpu usage')

// Hardware diagnostics
const cpu = await window.ev.system.getCPU()
const fullStats = await window.ev.system.getStats()

// Window Controls
window.windowControls.minimize()
window.windowControls.maximize()
window.windowControls.close()
```

---

## 🧠 Brain & Intent Engine

The intent engine (`src/main/brain/intent.js`) inspects user prompts and categorizes them into actionable operations:

| Recognized Keywords  | Detected Intent | Triggered Action                                |
| :------------------- | :-------------- | :---------------------------------------------- |
| `cpu`, `processor`   | `get_cpu`       | Reads CPU load, model, speed, and cores         |
| `ram`, `memory`      | `get_memory`    | Computes active, free, and total system RAM     |
| `battery`, `charge`  | `get_battery`   | Queries battery level and charging state        |
| `process`, `running` | `get_processes` | Fetches active running tasks & memory consumers |
| _Other text_         | `unknown`       | Forwards prompt to local AI / LLM pipeline      |

---

## 🧰 Native Module Compilation (better-sqlite3)

Because `better-sqlite3` uses native C++ bindings, its binary must match the exact ABI of Electron's internal Node engine (not just your global Node.js version).

1. **Automatic rebuild during install**:
   The `postinstall` script in `package.json` handles this:
   ```json
   "postinstall": "electron-builder install-app-deps"
   ```
2. **If you encounter `NODE_MODULE_VERSION` mismatch**:
   ```bash
   npx @electron/rebuild -f -w better-sqlite3
   ```

---

## 🤖 Optional: Setting up Ollama for Local AI

To enable on-device AI responses:

1. Download and install **Ollama** from [ollama.com](https://ollama.com).
2. Pull your preferred model (e.g. Llama 3 or Mistral):
   ```bash
   ollama pull llama3
   # or
   ollama pull mistral
   ```
3. Ensure the Ollama service is running on `http://localhost:11434`.
4. EV's `src/main/ai/ollama.js` module will automatically communicate with the local instance.

---

## 🔧 Recommended IDE & Extensions

For the best developer experience, use **VS Code** with the following extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (`dbaeumer.vscode-eslint`)
- [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (`esbenp.prettier-vscode`)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) (`bradlc.vscode-tailwindcss`)

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>1. Error: The module '...better_sqlite3.node' was compiled against a different Node.js version</b></summary>

Run the following command in your terminal to recompile against Electron's Node headers:

```bash
npx electron-builder install-app-deps
```

or

```bash
npx @electron/rebuild -f -w better-sqlite3
```

</details>

<details>
<summary><b>2. The window is transparent or black screen on Linux</b></summary>

Some Linux window managers require specific compositor settings or disabling GPU hardware acceleration flags:

```bash
npm run dev -- --no-sandbox --disable-gpu
```

</details>

<details>
<summary><b>3. Ollama connection refused (`ECONNREFUSED 127.0.0.1:11434`)</b></summary>

Ensure Ollama is started:

```bash
ollama serve
```

</details>

---

<div align="center">
  <sub>Built with ❤️ for next-gen desktop AI interfaces.</sub>
</div>
