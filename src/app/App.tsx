import { useMemo, useState } from 'react'
import type { ComponentInstance } from '../domain'
import { CanvasEditor } from '../layout/CanvasEditor'
import { LibraryPanel } from '../layout/LibraryPanel'
import { PropertiesPanel } from '../layout/PropertiesPanel'
import { StatusBar } from '../layout/StatusBar'
import { TopToolbar } from '../layout/TopToolbar'

const INITIAL_COMPONENTS: ComponentInstance[] = [
  {
    id: 'cmp-valve-1',
    type: 'Valve',
    label: 'Valve A',
    transform: { x: -220, y: -80, rot: 0, flipH: false, flipV: false },
    parameterValues: {},
  },
  {
    id: 'cmp-cylinder-1',
    type: 'Cylinder',
    label: 'Cylinder A',
    transform: { x: 40, y: 120, rot: 0, flipH: false, flipV: false },
    parameterValues: {},
  },
]

export function App() {
  const [components, setComponents] = useState<ComponentInstance[]>(INITIAL_COMPONENTS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [placingType, setPlacingType] = useState<string | null>(null)

  const selectedComponents = useMemo(
    () => components.filter((component) => selectedIds.includes(component.id)),
    [components, selectedIds],
  )

  return (
    <div className="workspace-layout">
      <TopToolbar />
      <div className="workspace-main">
        <LibraryPanel placingType={placingType} onSelectType={setPlacingType} />
        <CanvasEditor
          components={components}
          selectedIds={selectedIds}
          placingType={placingType}
          onSelect={(id, additive) => {
            setSelectedIds((current) => {
              if (!additive) {
                return [id]
              }

              return current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
            })
          }}
          onClearSelection={() => setSelectedIds([])}
          onMoveComponent={(id, x, y) => {
            setComponents((current) =>
              current.map((component) =>
                component.id === id
                  ? {
                      ...component,
                      transform: {
                        ...component.transform,
                        x,
                        y,
                      },
                    }
                  : component,
              ),
            )
          }}
          onPlaceComponent={(type, x, y) => {
            const id = `${type.toLowerCase()}-${Date.now().toString(36)}`
            setComponents((current) => [
              ...current,
              {
                id,
                type,
                label: `${type} ${current.length + 1}`,
                transform: { x, y, rot: 0, flipH: false, flipV: false },
                parameterValues: {},
              },
            ])
            setSelectedIds([id])
            setPlacingType(null)
          }}
        />
        <PropertiesPanel selectedComponents={selectedComponents} />
      </div>
      <StatusBar
        cursor="(Canvas active)"
        zoom="Mousewheel"
        diagnosticsCount={placingType ? 1 : 0}
      />
    </div>
  )
}
