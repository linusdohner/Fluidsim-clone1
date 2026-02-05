# Fluidsim Clone (M0 Bootstrap)

Lauffähiges Grundgerüst für eine Desktop-Anwendung mit **Tauri + React + TypeScript + Vite**.

## Voraussetzungen (Windows)

1. **Node.js LTS** (inkl. npm)
2. **Rust Toolchain** (`rustup` + `cargo`)
3. **Visual Studio 2022 Build Tools** (Desktop development with C++)
4. **Microsoft Edge WebView2 Runtime**

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

> Die Kommandos in einem Terminal im Projektordner ausführen (PowerShell oder Windows Terminal).

```powershell
cd C:\Pfad\zu\Fluidsim-clone1
npm install
npm run dev
```

> Für die Desktop-App ein zweites Terminal im selben Projektordner öffnen:

```powershell
cd C:\Pfad\zu\Fluidsim-clone1
npm run tauri dev
```

## Enthalten

- Vite + React + TypeScript Frontend
- Tauri v2 Backend mit Beispiel-Command `ping`
- Saubere Grundstruktur für nächste Milestones
