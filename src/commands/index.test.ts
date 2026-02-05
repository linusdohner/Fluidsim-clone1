import { describe, expect, it } from 'vitest'
import { createEmptyProject, type Project } from '../domain'
import {
  AddComponentCommand,
  CommandStack,
  DeleteComponentCommand,
  MoveComponentCommand,
} from './index'

const createProject = (): Project => ({
  ...createEmptyProject(),
  diagram: {
    components: [
      {
        id: 'c1',
        type: 'Valve',
        transform: { x: 10, y: 20, rot: 0, flipH: false, flipV: false },
        parameterValues: {},
      },
      {
        id: 'c2',
        type: 'Cylinder',
        transform: { x: 100, y: 120, rot: 0, flipH: false, flipV: false },
        parameterValues: {},
      },
    ],
    connections: [
      {
        id: 'conn-1',
        from: { componentId: 'c1', portId: 'out' },
        to: { componentId: 'c2', portId: 'in' },
        routingPoints: [],
      },
    ],
  },
})

describe('CommandStack', () => {
  it('supports execute, undo and redo', () => {
    const stack = new CommandStack<Project>()
    const initial = createEmptyProject()

    const next = stack.execute(
      new AddComponentCommand({
        id: 'new',
        type: 'Valve',
        transform: { x: 0, y: 0, rot: 0, flipH: false, flipV: false },
        parameterValues: {},
      }),
      initial,
    )

    expect(next.diagram.components).toHaveLength(1)
    expect(stack.canUndo()).toBe(true)
    expect(stack.canRedo()).toBe(false)

    const undone = stack.undo(next)
    expect(undone.diagram.components).toHaveLength(0)
    expect(stack.canUndo()).toBe(false)
    expect(stack.canRedo()).toBe(true)

    const redone = stack.redo(undone)
    expect(redone.diagram.components).toHaveLength(1)
    expect(stack.canUndo()).toBe(true)
    expect(stack.canRedo()).toBe(false)
  })
})

describe('commands', () => {
  it('MoveComponentCommand reverts to previous transform on undo', () => {
    const stack = new CommandStack<Project>()
    const initial = createProject()

    const moved = stack.execute(new MoveComponentCommand('c1', { x: 50, y: 60 }), initial)

    const movedComponent = moved.diagram.components.find((component) => component.id === 'c1')
    expect(movedComponent?.transform.x).toBe(50)
    expect(movedComponent?.transform.y).toBe(60)

    const undone = stack.undo(moved)
    const undoneComponent = undone.diagram.components.find((component) => component.id === 'c1')
    expect(undoneComponent?.transform.x).toBe(10)
    expect(undoneComponent?.transform.y).toBe(20)
  })

  it('DeleteComponentCommand removes linked connections and restores them on undo', () => {
    const stack = new CommandStack<Project>()
    const initial = createProject()

    const deleted = stack.execute(new DeleteComponentCommand('c1'), initial)

    expect(deleted.diagram.components.map((component) => component.id)).toEqual(['c2'])
    expect(deleted.diagram.connections).toHaveLength(0)

    const undone = stack.undo(deleted)
    expect(undone.diagram.components.map((component) => component.id).sort()).toEqual(['c1', 'c2'])
    expect(undone.diagram.connections).toHaveLength(1)
    expect(undone.diagram.connections[0].id).toBe('conn-1')
  })
})
