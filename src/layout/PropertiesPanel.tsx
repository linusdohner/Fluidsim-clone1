import type { ComponentInstance } from '../domain'

interface PropertiesPanelProps {
  selectedComponents: ComponentInstance[]
}

export function PropertiesPanel({ selectedComponents }: PropertiesPanelProps) {
  const singleSelection = selectedComponents.length === 1 ? selectedComponents[0] : null

  return (
    <aside className="panel panel-properties" aria-label="Properties panel">
      <h2 className="panel-title">Properties</h2>
      {singleSelection ? (
        <div className="properties-content">
          <p className="property-row">
            <strong>ID:</strong> {singleSelection.id}
          </p>
          <p className="property-row">
            <strong>Type:</strong> {singleSelection.type}
          </p>
          <p className="property-row">
            <strong>x:</strong> {Math.round(singleSelection.transform.x)}
          </p>
          <p className="property-row">
            <strong>y:</strong> {Math.round(singleSelection.transform.y)}
          </p>
          <p className="property-row">
            <strong>Rotation:</strong> {singleSelection.transform.rot}°
          </p>
        </div>
      ) : selectedComponents.length > 1 ? (
        <p className="panel-empty">{selectedComponents.length} components selected</p>
      ) : (
        <p className="panel-empty">Nothing selected</p>
      )}
    </aside>
  )
}
