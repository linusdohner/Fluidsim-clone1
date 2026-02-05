const MENU_ITEMS = ['File', 'Edit', 'View', 'Simulation', 'Insert', 'Tools']

export function TopToolbar() {
  return (
    <header className="top-toolbar" aria-label="Main toolbar">
      {MENU_ITEMS.map((item) => (
        <button key={item} type="button" className="toolbar-button">
          {item}
        </button>
      ))}
    </header>
  )
}
