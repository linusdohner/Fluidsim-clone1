interface StatusBarProps {
  cursor: string
  zoom: string
  diagnosticsCount: number
}

export function StatusBar({ cursor, zoom, diagnosticsCount }: StatusBarProps) {
  return (
    <footer className="status-bar" aria-label="Status bar">
      <span>Cursor: {cursor}</span>
      <span>Zoom: {zoom}</span>
      <span>Diagnostics: {diagnosticsCount}</span>
    </footer>
  )
}
