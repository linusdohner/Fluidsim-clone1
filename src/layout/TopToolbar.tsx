const MENU_ITEMS = ['File', 'Edit', 'View', 'Simulation', 'Insert', 'Tools']

interface TopToolbarProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export function TopToolbar({ canUndo, canRedo, onUndo, onRedo }: TopToolbarProps) {
  return (
    <header className="top-toolbar" aria-label="Main toolbar">
      <button type="button" className="toolbar-button" onClick={onUndo} disabled={!canUndo}>
        Undo
      </button>
      <button type="button" className="toolbar-button" onClick={onRedo} disabled={!canRedo}>
        Redo
      </button>
      {MENU_ITEMS.map((item) => (
        <button key={item} type="button" className="toolbar-button">
          {item}
        </button>
      ))}
    </header>
  )
}
