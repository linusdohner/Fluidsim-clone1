interface StatusBarProps {
  cursor: string
  zoom: string
  diagnosticsCount: number
  currentFileName: string
  isDirty: boolean
}

export function StatusBar({ cursor, zoom, diagnosticsCount, currentFileName, isDirty }: StatusBarProps) {
  return (
    <footer className="status-bar" aria-label="Status bar">
      <span>Cursor: {cursor}</span>
      <span>Zoom: {zoom}</span>
      <span>Diagnostics: {diagnosticsCount}</span>
      <span>
        File: {currentFileName}
        {isDirty ? ' *' : ''}
      </span>
    </footer>
  )
}
