interface LibraryItem {
  type: string
  label: string
}

interface LibraryPanelProps {
  placingType: string | null
  onSelectType: (type: string) => void
}

const LIBRARY_TREE: Array<{ group: string; items: LibraryItem[] }> = [
  {
    group: 'Hydraulics',
    items: [{ type: 'Valve', label: 'Valve' }],
  },
  {
    group: 'Pneumatics',
    items: [{ type: 'Cylinder', label: 'Cylinder' }],
  },
  {
    group: 'Electrical',
    items: [{ type: 'PowerSupply', label: 'Power Supply' }],
  },
]

export function LibraryPanel({ placingType, onSelectType }: LibraryPanelProps) {
  return (
    <aside className="panel panel-library" aria-label="Library panel">
      <h2 className="panel-title">Library</h2>
      <input
        className="panel-search"
        type="search"
        placeholder="Search assets..."
        aria-label="Search library"
      />
      <div className="library-tree" role="tree" aria-label="Library components">
        {LIBRARY_TREE.map((group) => (
          <div key={group.group} className="library-group" role="treeitem" aria-expanded="true">
            <p className="library-group-title">{group.group}</p>
            <ul className="library-items">
              {group.items.map((item) => {
                const isActive = placingType === item.type
                return (
                  <li key={item.type}>
                    <button
                      type="button"
                      className={`library-item-button ${isActive ? 'is-active' : ''}`}
                      onClick={() => onSelectType(item.type)}
                    >
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
