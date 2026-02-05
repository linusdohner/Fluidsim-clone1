import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  AddComponentCommand,
  CommandStack,
  DeleteComponentCommand,
  MoveComponentCommand,
} from '../commands'
import { createEmptyProject, type ComponentInstance, type Project } from '../domain'
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

const INITIAL_PROJECT: Project = {
  ...createEmptyProject(),
  diagram: {
    components: INITIAL_COMPONENTS,
    connections: [],
  },
}

export function App() {
  const [project, setProject] = useState<Project>(INITIAL_PROJECT)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [placingType, setPlacingType] = useState<string | null>(null)
  const [, forceHistoryTick] = useReducer((value: number) => value + 1, 0)
  const commandStackRef = useRef(new CommandStack<Project>())

  const components = project.diagram.components

  const selectedComponents = useMemo(
    () => components.filter((component) => selectedIds.includes(component.id)),
    [components, selectedIds],
  )

  const executeCommand = (command: AddComponentCommand | MoveComponentCommand | DeleteComponentCommand) => {
    setProject((current) => commandStackRef.current.execute(command, current))
    forceHistoryTick()
  }

  const undo = () => {
    setProject((current) => commandStackRef.current.undo(current))
    forceHistoryTick()
  }

  const redo = () => {
    setProject((current) => commandStackRef.current.redo(current))
    forceHistoryTick()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }

      if (event.key === 'Delete' && selectedIds.length === 1) {
        event.preventDefault()
        executeCommand(new DeleteComponentCommand(selectedIds[0]))
        setSelectedIds([])
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIds])

  return (
    <div className="workspace-layout">
      <TopToolbar
        canUndo={commandStackRef.current.canUndo()}
        canRedo={commandStackRef.current.canRedo()}
        onUndo={undo}
        onRedo={redo}
      />
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
            const component = components.find((item) => item.id === id)
            if (!component) {
              return
            }

            if (component.transform.x === x && component.transform.y === y) {
              return
            }

            executeCommand(new MoveComponentCommand(id, { x, y }))
          }}
          onPlaceComponent={(type, x, y) => {
            const id = `${type.toLowerCase()}-${Date.now().toString(36)}`
            executeCommand(
              new AddComponentCommand({
                id,
                type,
                label: `${type} ${components.length + 1}`,
                transform: { x, y, rot: 0, flipH: false, flipV: false },
                parameterValues: {},
              }),
            )
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
