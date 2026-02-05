export function LibraryPanel() {
  return (
    <aside className="panel panel-library" aria-label="Library panel">
      <h2 className="panel-title">Library</h2>
      <input
        className="panel-search"
        type="search"
        placeholder="Search assets..."
        aria-label="Search library"
      />
      <div className="tree-placeholder" role="tree" aria-label="Library tree placeholder">
        <p>Tree placeholder</p>
      </div>
    </aside>
  )
}
