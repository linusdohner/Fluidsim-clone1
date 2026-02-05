interface PropertiesPanelProps {
  selectedItem?: string | null
}

export function PropertiesPanel({ selectedItem }: PropertiesPanelProps) {
  return (
    <aside className="panel panel-properties" aria-label="Properties panel">
      <h2 className="panel-title">Properties</h2>
      {selectedItem ? (
        <div className="properties-content">
          <p className="property-row">
            <strong>Name:</strong> {selectedItem}
          </p>
          <p className="property-row">
            <strong>Type:</strong> Placeholder
          </p>
        </div>
      ) : (
        <p className="panel-empty">Nothing selected</p>
      )}
    </aside>
  )
}
