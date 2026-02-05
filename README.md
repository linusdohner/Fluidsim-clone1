# Fluidsim Clone (M0 Bootstrap)

Grundgerüst für eine Desktop-Anwendung mit **Tauri + React + TypeScript + Vite**.

## Voraussetzungen (Windows)

1. **Node.js LTS** (inkl. npm)
2. **Rust Toolchain**
3. **Visual Studio C++ Build Tools** (MSVC)
4. **WebView2 Runtime**

## Projektstruktur

```text
/src
  /app
  /ui
  /canvas
  /domain
  /storage
  /commands
  /simulation   # leer / planned
/src-tauri
```

## Exakte Run-Kommandos (Windows)

> Die Kommandos können in **PowerShell** oder **Windows Terminal** ausgeführt werden.

```powershell
npm install
npm run dev
```

In einem zweiten Terminal:

```powershell
npm run tauri dev
```

## Was ist enthalten?

- Vite + React + TypeScript Frontend
- Tauri v2 Backend mit Beispiel-Command `ping`
- Grundlegende Ordnerstruktur für die nächsten Milestones
