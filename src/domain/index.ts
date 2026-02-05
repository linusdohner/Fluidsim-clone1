export type DomainType = 'pneumatic' | 'hydraulic' | 'electric' | 'digital'

export interface Point {
  x: number
  y: number
}

export interface Transform {
  x: number
  y: number
  rot: number
  flipH: boolean
  flipV: boolean
}

export interface Port {
  id: string
  name: string
  kind: string
  positionLocal: Point
  direction: string
  domain: DomainType
}

export interface ComponentDefinition {
  type: string
  displayName: string
  categoryPath: string[]
  ports: Port[]
  parameterSchema: Record<string, unknown>
  iconRef?: string
  modelRef?: string
}

export interface ComponentInstance {
  id: string
  type: string
  transform: Transform
  parameterValues: Record<string, unknown>
  label?: string
}

export interface ConnectionEndpoint {
  componentId: string
  portId: string
}

export interface Connection {
  id: string
  from: ConnectionEndpoint
  to: ConnectionEndpoint
  routingPoints: Point[]
}

export interface Diagram {
  components: ComponentInstance[]
  connections: Connection[]
}

export interface Project {
  metadata: Record<string, unknown>
  version: string
  diagram: Diagram
}

export interface UnconnectedPortIssue {
  componentId: string
  portId: string
}

export interface DiagramValidationResult {
  duplicateIds: string[]
  invalidReferences: string[]
  unconnectedPorts: UnconnectedPortIssue[]
  isValid: boolean
}

const DEFAULT_TRANSFORM: Transform = {
  x: 0,
  y: 0,
  rot: 0,
  flipH: false,
  flipV: false,
}

export const createEmptyProject = (
  metadata: Record<string, unknown> = {},
  version = '1.0.0',
): Project => ({
  metadata,
  version,
  diagram: {
    components: [],
    connections: [],
  },
})

export const addComponent = (
  project: Project,
  component: Omit<ComponentInstance, 'transform'> & { transform?: Partial<Transform> },
): Project => {
  if (project.diagram.components.some((item) => item.id === component.id)) {
    throw new Error(`Component with id "${component.id}" already exists.`)
  }

  const nextComponent: ComponentInstance = {
    ...component,
    transform: {
      ...DEFAULT_TRANSFORM,
      ...component.transform,
    },
  }

  return {
    ...project,
    diagram: {
      ...project.diagram,
      components: [...project.diagram.components, nextComponent],
    },
  }
}

export const moveComponent = (
  project: Project,
  componentId: string,
  nextTransform: Partial<Transform>,
): Project => ({
  ...project,
  diagram: {
    ...project.diagram,
    components: project.diagram.components.map((component) =>
      component.id === componentId
        ? {
            ...component,
            transform: {
              ...component.transform,
              ...nextTransform,
            },
          }
        : component,
    ),
  },
})

export const removeComponent = (project: Project, componentId: string): Project => ({
  ...project,
  diagram: {
    components: project.diagram.components.filter((component) => component.id !== componentId),
    connections: project.diagram.connections.filter(
      (connection) =>
        connection.from.componentId !== componentId && connection.to.componentId !== componentId,
    ),
  },
})

export const addConnection = (project: Project, connection: Connection): Project => {
  if (project.diagram.connections.some((item) => item.id === connection.id)) {
    throw new Error(`Connection with id "${connection.id}" already exists.`)
  }

  const componentsById = new Map(project.diagram.components.map((component) => [component.id, component]))

  if (!componentsById.has(connection.from.componentId)) {
    throw new Error(`Unknown source component id "${connection.from.componentId}".`)
  }

  if (!componentsById.has(connection.to.componentId)) {
    throw new Error(`Unknown target component id "${connection.to.componentId}".`)
  }

  return {
    ...project,
    diagram: {
      ...project.diagram,
      connections: [...project.diagram.connections, connection],
    },
  }
}

export const validateDiagram = (
  diagram: Diagram,
  definitions: ComponentDefinition[] = [],
): DiagramValidationResult => {
  const duplicateIds: string[] = []
  const invalidReferences: string[] = []

  const componentsById = new Map<string, ComponentInstance>()
  for (const component of diagram.components) {
    if (componentsById.has(component.id)) {
      duplicateIds.push(`component:${component.id}`)
      continue
    }

    componentsById.set(component.id, component)
  }

  const connectionIds = new Set<string>()
  for (const connection of diagram.connections) {
    if (connectionIds.has(connection.id)) {
      duplicateIds.push(`connection:${connection.id}`)
    } else {
      connectionIds.add(connection.id)
    }

    if (!componentsById.has(connection.from.componentId)) {
      invalidReferences.push(
        `connection:${connection.id}:from.component:${connection.from.componentId}`,
      )
    }

    if (!componentsById.has(connection.to.componentId)) {
      invalidReferences.push(`connection:${connection.id}:to.component:${connection.to.componentId}`)
    }
  }

  const definitionsByType = new Map(definitions.map((definition) => [definition.type, definition]))
  const usedPorts = new Set<string>()

  for (const connection of diagram.connections) {
    usedPorts.add(`${connection.from.componentId}:${connection.from.portId}`)
    usedPorts.add(`${connection.to.componentId}:${connection.to.portId}`)

    const fromDefinition = definitionsByType.get(
      componentsById.get(connection.from.componentId)?.type ?? '',
    )
    const toDefinition = definitionsByType.get(componentsById.get(connection.to.componentId)?.type ?? '')

    if (fromDefinition && !fromDefinition.ports.some((port) => port.id === connection.from.portId)) {
      invalidReferences.push(`connection:${connection.id}:from.port:${connection.from.portId}`)
    }

    if (toDefinition && !toDefinition.ports.some((port) => port.id === connection.to.portId)) {
      invalidReferences.push(`connection:${connection.id}:to.port:${connection.to.portId}`)
    }
  }

  const unconnectedPorts: UnconnectedPortIssue[] = []

  for (const component of diagram.components) {
    const definition = definitionsByType.get(component.type)
    if (!definition) {
      continue
    }

    for (const port of definition.ports) {
      const key = `${component.id}:${port.id}`
      if (!usedPorts.has(key)) {
        unconnectedPorts.push({ componentId: component.id, portId: port.id })
      }
    }
  }

  return {
    duplicateIds,
    invalidReferences,
    unconnectedPorts,
    isValid:
      duplicateIds.length === 0 && invalidReferences.length === 0 && unconnectedPorts.length === 0,
  }
}

export const validateProject = (
  project: Project,
  definitions: ComponentDefinition[] = [],
): DiagramValidationResult => validateDiagram(project.diagram, definitions)
