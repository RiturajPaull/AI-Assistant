# ⚡ EV — Autonomous AI Desktop Assistant

<div align="center">

![Electron](https://img.shields.io/badge/Electron-43.4.1-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.2.6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FaceAPI](https://img.shields.io/badge/FaceAPI-Biometric_Auth-FFaA00?style=for-the-badge&logo=tensorflow&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-Model_Context_Protocol-purple?style=for-the-badge&logo=anthropic&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Sub--Second_Speed-orange?style=for-the-badge&logo=fastapi&logoColor=white)
![NVIDIA](https://img.shields.io/badge/NVIDIA-Nemotron_LLM-76B900?style=for-the-badge&logo=nvidia&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

<p align="center">
  A futuristic, Cyberpunk HUD autonomous AI desktop assistant equipped with <b>Face Biometric Security & Owner Recognition</b>, <b>Model Context Protocol (MCP)</b>, sub-second <b>Groq LLM</b> & <b>NVIDIA Nemotron</b> intelligence, <b>Whisper STT</b> voice input, and native desktop tool execution.
</p>

</div>

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [👤 Sci-Fi Face Biometric Security & Owner Profile Engine](#-sci-fi-face-biometric-security--owner-profile-engine)
- [🏗 Comprehensive System Architecture & Flow](#-comprehensive-system-architecture--flow)
- [⚙️ Prerequisites & Environment Setup](#️-prerequisites--environment-setup)
- [🚀 Step-by-Step Installation Guide](#-step-by-step-installation-guide)
- [🔑 Environment Variables Configuration (`.env`)](#-environment-variables-configuration-env)
- [🔌 Model Context Protocol (MCP) Tool Servers](#-model-context-protocol-mcp-tool-servers)
- [📂 Complete Project Directory Structure](#-complete-project-directory-structure)
- [📦 Package & Dependency Breakdown](#-package--dependency-breakdown)
- [🛠 Available NPM Scripts](#-available-npm-scripts)
- [⚡ Real-Time Hardware Diagnostics](#-real-time-hardware-diagnostics)
- [🎙 Voice Input, TTS & Whisper Speech-to-Text](#-voice-input-tts--whisper-speech-to-text)
- [🧰 Native Module Compilation (`better-sqlite3`)](#-native-module-compilation-better-sqlite3)
- [❓ Troubleshooting & FAQ](#-troubleshooting--faq)

---

## ✨ Key Features

- **🛡️ Sci-Fi Face Biometric Security & Owner Recognition**: 3D facial landmark detection and 128D vector embedding comparison powered by `@vladmandic/face-api` (offline local model binaries). Supports owner name enrollment and personalized voice greetings (*"Access granted. Welcome back, [Your Name]!"*).
- **📟 Futuristic Cyberpunk HUD Interface**: Inspired by sci-fi tactical displays, featuring a 16-segment HUD progress loader, rotating reticle rings, horizontal laser scanning sweep, telemetry grid readouts, ambient grid mesh, and dynamic status badges.
- **🌐 Model Context Protocol (MCP) Desktop Tools**: Runs 5 standalone MCP tool servers over `stdio` streams for filesystem, system vitals, browser automation, terminal execution, and desktop applications.
- **⚡ Ultra-Fast Dual LLM Engine**: Powered by **Groq API** (`qwen/qwen3.8-27b` with ~500ms latency) and **NVIDIA Nemotron NIM** API (`nvidia/nemotron-3.5-lightning-30b-a3b`, `mistralai/mistral-nemotron`) with strict request timeouts and automatic fallback.
- **🎙 Voice Control & Whisper STT**: Integrated OpenAI Whisper Speech-to-Text engine paired with Karen-profile Speech Synthesis (TTS) for natural voice interaction.
- **🔍 Smart Platform & Search URL Resolver**: Translates natural commands like *"EV, search lo-fi music on YouTube"* or *"electron js on GitHub"* into direct, query-targeted browser URLs.
- **📊 Real-Time Hardware Diagnostics**: Live monitoring of CPU usage, multi-core loads, RAM capacity, battery charge level, and active processes via `systeminformation`.
- **💾 Local Persistence**: High-performance synchronous SQLite storage via `better-sqlite3`.

---

## 👤 Sci-Fi Face Biometric Security & Owner Profile Engine

EV includes a built-in facial biometric authentication overlay that gates desktop access until the authorized owner is recognized.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FACE BIOMETRIC AUTH OVERLAY                               │
│                                                                                        │
│   ┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────────┐   │
│   │   Webcam Feed & Laser   │  │   68 Facial Landmarks  │  │  128D Vector Matrix     │   │
│   │   Sweep Viewport       │  │   Extraction Engine    │  │  Euclidean Match (<0.48)│   │
│   └───────────┬────────────┘  └───────────┬────────────┘  └────────────┬────────────┘   │
│               │                           │                            │                │
│               └───────────────────────────┴────────────────────────────┘                │
│                                           │                                             │
│                                           ▼                                             │
│                       ┌───────────────────────────────────────┐                         │
│                       │   LOCAL STORAGE PROFILE REGISTRATION  │                         │
│                       │   - Face Descriptor Float32 Array     │                         │
│                       │   - Owner Name (e.g., "Tony")         │                         │
│                       └───────────────────┬───────────────────┘                         │
│                                           │                                             │
│                                           ▼                                             │
│                       ┌───────────────────────────────────────┐                         │
│                       │    TTS VOCAL PERSONALIZED GREETING    │                         │
│                       │  "Access granted. Welcome back, Tony!"│                         │
│                       └───────────────────────────────────────┘                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Biometric Features:
- **Offline Model Execution**: Loads local model binaries (`tiny_face_detector`, `face_landmark_68`, `face_recognition`) directly from `/models/` without internet dependency, with CDN fallback.
- **Owner Profile Enrollment**: Prompts new users for their custom name upon face capture and binds the profile to local storage.
- **Personalized TTS Greetings**: Speaks custom greetings upon verification (`"Access granted. Welcome back, [Name]!"`).
- **Telemetry Readouts**: Displays live facial landmarks count (68 points), Euclidean match distance score, Subject ID, and 256-bit encryption status.

---

## 🏗 Comprehensive System Architecture & Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    REACT 19 RENDERER                                   │
│    (Face Biometric Lock, HUD Desktop Orb, Voice Input, Diagnostic Cards, Chat)       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ IPC (window.ev / window.system)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ELECTRON MAIN PROCESS                                  │
│                                                                                        │
│   ┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────────┐   │
│   │   Audio Transcriber    │  │    Hardware Vitals     │  │    Intent Classifier    │   │
│   │   (Whisper STT API)    │  │  (systeminformation)   │  │    (Fast Hardware Path) │   │
│   └────────────────────────┘  └────────────────────────┘  └────────────┬────────────┘   │
│                                                                        │               │
│                                                                        ▼               │
│                                                          ┌───────────────────────────┐ │
│                                                          │  Autonomous Agent Loop    │ │
│                                                          │  (src/main/ai/agent.js)   │ │
│                                                          └─────────────┬─────────────┘ │
└────────────────────────────────────────────────────────────────────────│───────────────┘
                                                                         │
                                       ┌─────────────────────────────────┴─────────────────────────────────┐
                                       │                                                                   │
                                       ▼                                                                   ▼
┌─────────────────────────────────────────────────────────────┐   ┌─────────────────────────────────────────────────────────────┐
│                    MCP MANAGER CLIENT                       │   │                   LLM PROVIDER ROUTER                       │
│                 (src/main/mcp/mcpManager.js)                │   │                   (src/main/ai/llm.js)                      │
│                                                             │   │                                                             │
│  Spawns & connects stdio MCP servers from mcp_config.json:  │   │  1. Primary: Groq API (qwen/qwen3.8-27b) ~500ms           │
│  - System Server       (CPU, RAM, Battery)                  │   │  2. Fallback: NVIDIA Nemotron NIM API                      │
│  - Applications Server (App Launcher/Closer)               │   │  3. Strict 7s Request Timeouts & Auto Failover             │
│  - Filesystem Server   (Read, Write, Search)                │   └─────────────────────────────────────────────────────────────┘
│  - Terminal Server     (Shell Commands)                     │
│  - Browser Server      (Smart URL & Platform Resolver)      │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Prerequisites & Environment Setup

Before running or building the project, ensure your environment meets the following requirements:

1. **Node.js**: `v18.0.0` or higher (`v20.x` LTS recommended).
   ```bash
   node -v
   ```
2. **NPM**: `v9.0.0` or higher.
   ```bash
   npm -v
   ```
3. **C++ Build Tools** (Required for compiling `better-sqlite3` native C++ bindings):
   - **Windows**: Run PowerShell as Administrator:
     ```powershell
     npm install --global --production windows-build-tools
     ```
     *Or install Visual Studio C++ Build Tools.*
   - **macOS**: Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```
   - **Linux (Ubuntu/Debian)**:
     ```bash
     sudo apt-get update
     sudo apt-get install -y build-essential python3
     ```

---

## 🚀 Step-by-Step Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/RiturajPaull/AI-Assistant.git
cd AI-Assistant
```

### 2. Install Project Dependencies

Run `npm install` to download all required packages:

```bash
npm install
```

> **Note**: The `postinstall` script (`electron-builder install-app-deps`) will execute automatically to compile `better-sqlite3` against Electron's Node headers.

### 3. Configure Environment Variables (`.env`)

Create a `.env` file in the root directory (or copy `.env.example`):

```bash
cp .env.example .env
```

Add your API keys to `.env` (see the [Environment Variables](#-environment-variables-configuration-env) section below).

### 4. Start Development Server

Launch EV in development mode with Hot Module Replacement (HMR):

```bash
npm run dev
```

The Cyberpunk HUD floating interface will launch on your desktop.

---

## 🔑 Environment Variables Configuration (`.env`)

Configure your API keys in the `.env` file located at the project root:

```env
# NVIDIA Nemotron NIM Endpoint Configuration
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b

# Groq Sub-Second LLM API Configuration (Recommended for ~500ms responses)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
```

---

## 🔌 Model Context Protocol (MCP) Tool Servers

EV uses standalone MCP server scripts located in `src/main/mcp/servers/`, managed by `mcp_config.json`:

| MCP Server | Script File | Registered Tools | Description |
| :--- | :--- | :--- | :--- |
| **System** | `systemServer.mjs` | `get_system_stats`, `get_cpu_stats`, `get_memory_stats`, `get_battery_stats`, `get_process_list` | Fetches hardware diagnostics & system metrics. |
| **Applications**| `appServer.mjs` | `open_application`, `close_application` | Launches or terminates local desktop applications. |
| **Filesystem** | `filesystemServer.mjs` | `read_file`, `write_file`, `search_files` | Performs local file operations & searches. |
| **Terminal** | `terminalServer.mjs` | `execute_command` | Executes safe terminal/shell commands. |
| **Browser** | `browserServer.mjs` | `open_browser_url` | Smart search URL resolver for YouTube, Google, GitHub, Reddit, & Wikipedia. |

---

## 📂 Complete Project Directory Structure

```
EV/
├── .env                         # Local environment configuration & API keys
├── .env.example                 # Example environment template
├── .gitattributes               # Binary model file line-ending rules
├── .gitignore                   # Git ignore policies
├── electron-builder.yml         # Application packaging configuration
├── electron.vite.config.mjs     # Electron-Vite multi-target build settings
├── mcp_config.json              # MCP standalone tool servers registry
├── package.json                 # Project manifest & NPM scripts
├── resources/                   # Application icons & static branding
└── src/                         # Core Source Code
    ├── main/                    # Electron Main Process (Node.js Backend)
    │   ├── ai/                  # LLM & AI Pipelines (agent.js, llm.js, stt.js)
    │   ├── brain/               # Prompt & Intent Engine
    │   ├── database/            # SQLite Storage Layer (better-sqlite3)
    │   ├── mcp/                 # Model Context Protocol Client & Servers
    │   └── system/              # Hardware Diagnostics (CPU, RAM, GPU, Battery)
    ├── preload/                 # Preload Scripts (Secure IPC Bridge)
    └── renderer/                # React 19 Frontend (Cyberpunk HUD User Interface)
        ├── index.html           # Meta CSP & HTML Root
        ├── public/              # Static Assets & Offline FaceAPI Models
        │   └── models/          # .bin & manifest files for TinyFaceDetector, LandMarks, & Recognition
        └── src/
            ├── App.jsx          # Main HUD Window, Core Reticle & Speech UI
            ├── components/      # UI components, response cards & Auth Overlays
            │   └── auth/
            │       └── FaceAuthOverlay.jsx # Sci-Fi Biometric Face Authentication Card
            ├── utils/           # Helper utilities
            │   ├── faceAuth.js  # FaceAPI Model Loader, Vector Extractor & LocalStorage Profile Manager
            │   └── tts.js       # Text-to-Speech Vocal Synthesis Engine
            └── styles/          # Tailwind CSS v4 & Cyberpunk HUD Styling
```

---

## 📦 Package & Dependency Breakdown

### Production Dependencies (`dependencies`)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **`@vladmandic/face-api`** | `^1.7.15` | Neural network models for face detection, landmark matrix & recognition. |
| **`@modelcontextprotocol/sdk`** | `^1.30.0` | Official MCP SDK for stdio server/client communication. |
| **`openai`** | `^7.8.0` | Official OpenAI client used for Groq, NVIDIA NIM, & Whisper STT. |
| **`better-sqlite3`** | `^13.0.3` | Ultra-fast synchronous SQLite database for local history. |
| **`systeminformation`** | `^5.33.2` | System hardware profiling (CPU, RAM, GPU, Battery). |
| **`framer-motion`** | `^13.1.1` | Fluid animations for HUD cards and desktop widgets. |
| **`tailwindcss`** | `^4.3.3` | Utility-first CSS framework. |
| **`lucide-react`** | `^1.34.0` | High-tech UI icon suite. |

---

## 🛠 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts EV in development mode with HMR for Main, Preload, and Renderer. |
| `npm run build` | Compiles all targets into `./out`. |
| `npm run build:win` | Builds a standalone Windows installer (`.exe`). |
| `npm run build:mac` | Builds a macOS package (`.dmg`). |
| `npm run build:linux` | Builds a Linux package (`.AppImage`, `.deb`). |
| `npm run postinstall` | Rebuilds native binaries (`better-sqlite3`) for Electron. |

---

## ⚡ Real-Time Hardware Diagnostics

EV provides instant real-time telemetry for desktop hardware:

- **🖥️ CPU**: Core count, clock speed, model, real-time load %.
- **💾 Memory**: Active, free, and total system RAM.
- **🔋 Battery**: Charge percentage, charging state, remaining runtime.
- **⚙️ Processes**: Top running processes ordered by CPU/RAM consumption.

---

## 🎙 Voice Input, TTS & Whisper Speech-to-Text

EV includes full voice input & vocal feedback capabilities:

1. Click the glowing microphone icon on the HUD UI (or hold the speech button).
2. Audio is captured via Web MediaRecorder API in webm/wav format.
3. Transmitted securely via IPC (`ev:transcribe`) to `transcribeAudio()` in `src/main/ai/stt.js`.
4. Transcribed into text via Whisper STT and automatically executed through the Autonomous Agent loop.
5. EV responds vocally using the built-in TTS engine tuned with Karen-profile acoustics.

---

## 🧰 Native Module Compilation (`better-sqlite3`)

If you encounter `NODE_MODULE_VERSION` mismatch errors when launching the app:

```bash
npm run postinstall
```
or
```bash
npx @electron/rebuild -f -w better-sqlite3
```

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>1. EV responses are taking too long</b></summary>

Ensure you have configured a valid `GROQ_API_KEY` in your `.env` file. Groq responds in **~500ms**, whereas NVIDIA free endpoints may occasionally queue requests.
</details>

<details>
<summary><b>2. Face recognition models fail to load locally</b></summary>

Ensure the `.bin` and manifest files exist inside `src/renderer/public/models/`. The system will automatically fall back to jsDelivr CDN if local files are missing.
</details>

<details>
<summary><b>3. Camera permission error on Windows</b></summary>

If you receive `NotAllowedError: Permission denied by system`, open **Windows Settings > Privacy & security > Camera** and ensure **"Let desktop apps access your camera"** is toggled **ON**.
</details>

---

<div align="center">
  <sub>Built with ❤️ for next-gen desktop AI interfaces.</sub>
</div>
