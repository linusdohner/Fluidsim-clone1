Open Circuit & Fluid Simulation Studio
Cross-platform Desktop application (Windows / macOS / Linux) for pneumatic, hydraulic, electrical, and digital circuit simulation.

The goal is a workflow similar to industrial training tools:

Component library on the left
Infinite canvas editor in the center
Properties / parameter panel on the right
Start / stop simulation, measurements, scopes, and parts list
⚠️ This is an original, independent project. No proprietary formats, assets, names, or icons are used.

Project Status
🚧 Early development – Milestone M1 (Editor & Project System)

Current focus:

Editor layout & canvas
Component library (placeholder components)
Project data model
Save / Load / Autosave
Undo / Redo
Simulation engines are not implemented yet.

Tech Stack (initial)
Desktop shell: Tauri
UI: React + TypeScript
Rendering: Canvas (Konva.js)
State management: Zustand
Build tooling: Vite
Testing: Vitest
Later stages may add:

Rust or C++ simulation plugins
WebGL rendering
Plugin system for components
Repository Structure (planned)
/src
  /app            # App bootstrap & layout
  /ui             # Panels (Library, Canvas, Properties, Toolbar)
  /canvas         # Drawing & interaction logic
  /domain         # Project, Components, Connections (pure logic)
  /simulation     # Solver & models (later milestones)
  /storage        # Save / Load / Autosave
  /commands       # Undo / Redo command pattern
/docs
  spec.md         # Full product specification
  roadmap.md      # Milestones & progress
/demo
  basic_project.json
How to Run (M1 prototype)
npm install
npm run dev
# in another terminal
npm run tauri dev
Milestones
 M0 – Project setup & specification
 M1 – Editor, Library, Save/Load (no real solver)
 M2 – Pneumatic simulation engine
 M3 – Hydraulic simulation & measurements
 M4 – Electrical & digital logic + coupling
 M5 – GRAFCET, import/export, parts list
Legal & Licensing
No usage of proprietary software, formats, or icons
All symbols are generic or self-created
This project is not affiliated with any commercial vendor
Contribution Guidelines (early stage)
Keep domain logic UI-agnostic
Prefer small, composable components
All new features should include basic tests
