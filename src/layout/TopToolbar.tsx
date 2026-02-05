const MENU_ITEMS = ['Edit', 'View', 'Simulation', 'Insert', 'Tools']

interface TopToolbarProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onNewFile: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onSaveAsFile: () => void
}

export function TopToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onSaveAsFile,
}: TopToolbarProps) {
  return (
    <header className="top-toolbar" aria-label="Main toolbar">
      <div className="toolbar-group" aria-label="File menu">
        <button type="button" className="toolbar-button" onClick={onNewFile}>
          New
        </button>
        <button type="button" className="toolbar-button" onClick={onOpenFile}>
          Open
        </button>
        <button type="button" className="toolbar-button" onClick={onSaveFile}>
          Save
        </button>
        <button type="button" className="toolbar-button" onClick={onSaveAsFile}>
          Save As
        </button>
      </div>
      <div className="toolbar-group" aria-label="Edit menu">
        <button type="button" className="toolbar-button" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" className="toolbar-button" onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
      </div>
      {MENU_ITEMS.map((item) => (
        <button key={item} type="button" className="toolbar-button">
          {item}
        </button>
      ))}
    </header>
  )
}
