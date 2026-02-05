import { CanvasEditor } from '../layout/CanvasEditor'
import { LibraryPanel } from '../layout/LibraryPanel'
import { PropertiesPanel } from '../layout/PropertiesPanel'
import { StatusBar } from '../layout/StatusBar'
import { TopToolbar } from '../layout/TopToolbar'

export function App() {
  const selectedItem = null

  return (
    <div className="workspace-layout">
      <TopToolbar />
      <div className="workspace-main">
        <LibraryPanel />
        <CanvasEditor />
        <PropertiesPanel selectedItem={selectedItem} />
      </div>
      <StatusBar cursor="(0, 0)" zoom="100%" diagnosticsCount={0} />
    </div>
  )
}
