import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  AddComponentCommand,
  CommandStack,
  DeleteComponentCommand,
  MoveComponentCommand,
} from '../commands'
import {
  createEmptyProject,
  type ComponentDefinition,
  type ComponentInstance,
  type Project,
  validateProject,
} from '../domain'
import { CanvasEditor } from '../layout/CanvasEditor'
import { DiagnosticsPanel, type DiagnosticItem } from '../layout/DiagnosticsPanel'
import { LibraryPanel } from '../layout/LibraryPanel'
import { PropertiesPanel } from '../layout/PropertiesPanel'
import { StatusBar } from '../layout/StatusBar'
import { TopToolbar } from '../layout/TopToolbar'
import {
  clearAutosave,
  loadAutosave,
  loadProjectFromFile,
  saveAutosave,
  saveProjectToFile,
} from '../storage'

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

const DEFAULT_FILE_NAME = 'project.json'

const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: 'Valve',
    displayName: 'Valve',
    categoryPath: ['Pneumatics'],
    ports: [
      { id: 'in', name: 'In', kind: 'fluid', positionLocal: { x: 0, y: 35 }, direction: 'in', domain: 'pneumatic' },
      {
        id: 'out',
        name: 'Out',
        kind: 'fluid',
        positionLocal: { x: 150, y: 35 },
        direction: 'out',
        domain: 'pneumatic',
      },
    ],
    parameterSchema: {},
  },
  {
    type: 'Cylinder',
    displayName: 'Cylinder',
    categoryPath: ['Pneumatics'],
    ports: [
      { id: 'in', name: 'In', kind: 'fluid', positionLocal: { x: 0, y: 35 }, direction: 'in', domain: 'pneumatic' },
    ],
    parameterSchema: {},
  },
]

const extractComponentIdFromReference = (reference: string): string | undefined => {
  const match = reference.match(/^connection:[^:]+:(?:from|to)\.component:([^:]+)$/)
  return match?.[1]
}

export function App() {
  const [project, setProject] = useState<Project>(INITIAL_PROJECT)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [placingType, setPlacingType] = useState<string | null>(null)
  const [currentFileName, setCurrentFileName] = useState<string>(DEFAULT_FILE_NAME)
  const [isDirty, setIsDirty] = useState(false)
  const [focusRequest, setFocusRequest] = useState<{ componentId: string; token: number }>()
  const [, forceHistoryTick] = useReducer((value: number) => value + 1, 0)
  const commandStackRef = useRef(new CommandStack<Project>())

  const components = project.diagram.components

  const selectedComponents = useMemo(
    () => components.filter((component) => selectedIds.includes(component.id)),
    [components, selectedIds],
  )

  const diagnostics = useMemo<DiagnosticItem[]>(() => {
    const validation = validateProject(project, COMPONENT_DEFINITIONS)

    return [
      ...validation.unconnectedPorts.map((issue) => ({
        id: `unconnected:${issue.componentId}:${issue.portId}`,
        category: 'unconnected-port' as const,
        componentId: issue.componentId,
        message: `Component "${issue.componentId}" port "${issue.portId}" is not connected.`,
      })),
      ...validation.invalidReferences.map((reference, index) => ({
        id: `invalid:${index}:${reference}`,
        category: 'invalid-reference' as const,
        componentId: extractComponentIdFromReference(reference),
        message: reference,
      })),
      ...validation.duplicateIds.map((duplicateId, index) => ({
        id: `duplicate:${index}:${duplicateId}`,
        category: 'duplicate-id' as const,
        message: duplicateId,
      })),
    ]
  }, [project])

  const executeCommand = (command: AddComponentCommand | MoveComponentCommand | DeleteComponentCommand) => {
    setProject((current) => commandStackRef.current.execute(command, current))
    setIsDirty(true)
    forceHistoryTick()
  }

  const undo = () => {
    setProject((current) => commandStackRef.current.undo(current))
    setIsDirty(true)
    forceHistoryTick()
  }

  const redo = () => {
    setProject((current) => commandStackRef.current.redo(current))
    setIsDirty(true)
    forceHistoryTick()
  }

  useEffect(() => {
    const autosaved = loadAutosave()
    if (!autosaved) {
      return
    }

    if (window.confirm('Recover autosave?')) {
      setProject(autosaved)
      setIsDirty(true)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      saveAutosave(project)
    }, 10_000)

    return () => window.clearInterval(timer)
  }, [project])

  const onSave = async (fileName = currentFileName) => {
    await saveProjectToFile(project, fileName)
    setCurrentFileName(fileName)
    setIsDirty(false)
    clearAutosave()
  }

  const onSaveAs = async () => {
    const nextFileName = window.prompt('Save as', currentFileName) ?? currentFileName
    if (!nextFileName) {
      return
    }

    await onSave(nextFileName)
  }

  const onOpen = async () => {
    const fileName = window.prompt('Open file', currentFileName) ?? currentFileName
    if (!fileName) {
      return
    }

    const opened = await loadProjectFromFile(fileName)
    if (!opened) {
      window.alert('No project file found.')
      return
    }

    setProject(opened)
    setCurrentFileName(fileName)
    setSelectedIds([])
    setPlacingType(null)
    setIsDirty(false)
    commandStackRef.current = new CommandStack<Project>()
    forceHistoryTick()
  }

  const onNew = () => {
    setProject(createEmptyProject())
    setSelectedIds([])
    setPlacingType(null)
    setIsDirty(false)
    commandStackRef.current = new CommandStack<Project>()
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

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void onSave()
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
  }, [selectedIds, project, currentFileName])

  return (
    <div className="workspace-layout">
      <TopToolbar
        canUndo={commandStackRef.current.canUndo()}
        canRedo={commandStackRef.current.canRedo()}
        onUndo={undo}
        onRedo={redo}
        onNewFile={onNew}
        onOpenFile={() => {
          void onOpen()
        }}
        onSaveFile={() => {
          void onSave()
        }}
        onSaveAsFile={() => {
          void onSaveAs()
        }}
      />
      <div className="workspace-main">
        <LibraryPanel placingType={placingType} onSelectType={setPlacingType} />
        <CanvasEditor
          components={components}
          selectedIds={selectedIds}
          placingType={placingType}
          focusRequest={focusRequest}
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
        <div className="right-sidebar">
          <DiagnosticsPanel
            diagnostics={diagnostics}
            onFocusDiagnostic={(diagnostic) => {
              if (!diagnostic.componentId) {
                return
              }

              setSelectedIds([diagnostic.componentId])
              setFocusRequest({ componentId: diagnostic.componentId, token: Date.now() })
            }}
          />
          <PropertiesPanel selectedComponents={selectedComponents} />
        </div>
      </div>
      <StatusBar
        cursor="(Canvas active)"
        zoom="Mousewheel"
        diagnosticsCount={diagnostics.length}
        currentFileName={currentFileName}
        isDirty={isDirty}
      />
    </div>
  )
}
