export interface DiagnosticItem {
  id: string
  message: string
  componentId?: string
  category: 'unconnected-port' | 'invalid-reference' | 'duplicate-id'
}

interface DiagnosticsPanelProps {
  diagnostics: DiagnosticItem[]
  onFocusDiagnostic: (diagnostic: DiagnosticItem) => void
}

const categoryLabel: Record<DiagnosticItem['category'], string> = {
  'unconnected-port': 'Unconnected Port',
  'invalid-reference': 'Invalid Connection',
  'duplicate-id': 'Duplicate ID',
}

export function DiagnosticsPanel({ diagnostics, onFocusDiagnostic }: DiagnosticsPanelProps) {
  return (
    <aside className="panel panel-diagnostics" aria-label="Diagnostics panel">
      <h2 className="panel-title">Diagnostics</h2>
      {diagnostics.length === 0 ? (
        <p className="panel-empty">No diagnostics.</p>
      ) : (
        <ul className="diagnostics-list">
          {diagnostics.map((diagnostic) => (
            <li key={diagnostic.id} className="diagnostics-item">
              <button
                type="button"
                className="diagnostics-item-button"
                onClick={() => onFocusDiagnostic(diagnostic)}
              >
                <strong>{categoryLabel[diagnostic.category]}</strong>
                <span>{diagnostic.message}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
