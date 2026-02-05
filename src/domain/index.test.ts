import { describe, expect, it } from 'vitest'
import {
  addComponent,
  addConnection,
  createEmptyProject,
  removeComponent,
  type ComponentDefinition,
  validateProject,
} from './index'

const valveDefinition: ComponentDefinition = {
  type: 'valve',
  displayName: 'Valve',
  categoryPath: ['Pneumatic', 'Control'],
  ports: [
    {
      id: 'in',
      name: 'In',
      kind: 'flow',
      positionLocal: { x: 0, y: 0 },
      direction: 'west',
      domain: 'pneumatic',
    },
    {
      id: 'out',
      name: 'Out',
      kind: 'flow',
      positionLocal: { x: 100, y: 0 },
      direction: 'east',
      domain: 'pneumatic',
    },
  ],
  parameterSchema: {},
}

describe('domain helpers', () => {
  it('createEmptyProject initializes empty diagram', () => {
    const project = createEmptyProject({ name: 'Demo' }, '2.0.0')

    expect(project.metadata).toEqual({ name: 'Demo' })
    expect(project.version).toBe('2.0.0')
    expect(project.diagram.components).toEqual([])
    expect(project.diagram.connections).toEqual([])
  })

  it('adds and removes components including linked connections', () => {
    const baseProject = createEmptyProject()
    const withA = addComponent(baseProject, {
      id: 'c1',
      type: 'valve',
      parameterValues: {},
    })
    const withB = addComponent(withA, {
      id: 'c2',
      type: 'valve',
      parameterValues: {},
      transform: { x: 20, y: 40 },
    })

    const connected = addConnection(withB, {
      id: 'conn-1',
      from: { componentId: 'c1', portId: 'out' },
      to: { componentId: 'c2', portId: 'in' },
      routingPoints: [],
    })

    expect(connected.diagram.components).toHaveLength(2)
    expect(connected.diagram.connections).toHaveLength(1)

    const removed = removeComponent(connected, 'c1')

    expect(removed.diagram.components.map((component) => component.id)).toEqual(['c2'])
    expect(removed.diagram.connections).toHaveLength(0)
  })
})

describe('validation', () => {
  it('detects duplicate ids and invalid references', () => {
    const result = validateProject(
      {
        metadata: {},
        version: '1',
        diagram: {
          components: [
            {
              id: 'dup',
              type: 'valve',
              transform: { x: 0, y: 0, rot: 0, flipH: false, flipV: false },
              parameterValues: {},
            },
            {
              id: 'dup',
              type: 'valve',
              transform: { x: 0, y: 0, rot: 0, flipH: false, flipV: false },
              parameterValues: {},
            },
          ],
          connections: [
            {
              id: 'cx',
              from: { componentId: 'missing', portId: 'out' },
              to: { componentId: 'dup', portId: 'invalid-port' },
              routingPoints: [],
            },
          ],
        },
      },
      [valveDefinition],
    )

    expect(result.duplicateIds).toContain('component:dup')
    expect(result.invalidReferences).toContain('connection:cx:from.component:missing')
    expect(result.invalidReferences).toContain('connection:cx:to.port:invalid-port')
    expect(result.isValid).toBe(false)
  })

  it('detects unconnected ports', () => {
    const project = addComponent(createEmptyProject(), {
      id: 'c1',
      type: 'valve',
      parameterValues: {},
    })

    const result = validateProject(project, [valveDefinition])

    expect(result.unconnectedPorts).toEqual([
      { componentId: 'c1', portId: 'in' },
      { componentId: 'c1', portId: 'out' },
    ])
    expect(result.isValid).toBe(false)
  })
})
