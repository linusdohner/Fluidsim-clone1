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

## Demo-Projekte laden

Im Ordner `demo/` liegen drei Beispielprojekte im aktuellen Schema (`schemaVersion: 1`):

- `demo/demo_pneumatic_basic.json`
- `demo/demo_hydraulic_basic.json`
- `demo/demo_electric_basic.json`

### Variante A: Browser-Dev-Modus (`npm run dev`)

Die Web-Variante lädt/speichert Projekte über `localStorage` unter dem Dateinamen als Key.

1. Dateiinhalt einer Demo-JSON öffnen und komplett kopieren.
2. App im Browser starten.
3. Browser-DevTools öffnen und unter **Console** ausführen (Beispiel für Pneumatik):

```js
localStorage.setItem('demo_pneumatic_basic.json', `...hier den JSON-Inhalt einfügen...`)
```

4. In der App auf **Open** klicken.
5. Als Dateiname z. B. `demo_pneumatic_basic.json` eingeben.

### Variante B: Tauri-Desktop (`npm run tauri dev`)

Die Desktop-Variante liest Dateien aus dem Tauri-`appDataDir`.

1. Gewünschte Demo-Datei aus `demo/` in das AppData-Verzeichnis der Anwendung kopieren.
2. In der App **Open** klicken.
3. Den kopierten Dateinamen eingeben (z. B. `demo_hydraulic_basic.json`).

> Hinweis: Die Demos enthalten absichtlich einfache/teilweise nicht in der Bibliothek hinterlegte Typnamen, sind aber für das Projekt-Schema korrekt serialisiert und damit ladbar.
