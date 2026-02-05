import { invoke } from '@tauri-apps/api/core'
import {
  addComponent,
  moveComponent,
  removeComponent,
  type ComponentInstance,
  type Connection,
  type Project,
  type Transform,
} from '../domain'

export async function pingBackend(): Promise<string> {
  return invoke<string>('ping')
}

export interface Command<TState> {
  execute: (state: TState) => TState
  undo: (state: TState) => TState
}

export class CommandStack<TState> {
  private readonly undoStack: Command<TState>[] = []
  private readonly redoStack: Command<TState>[] = []

  execute(command: Command<TState>, state: TState): TState {
    const nextState = command.execute(state)
    this.undoStack.push(command)
    this.redoStack.length = 0
    return nextState
  }

  undo(state: TState): TState {
    const command = this.undoStack.pop()
    if (!command) {
      return state
    }

    const nextState = command.undo(state)
    this.redoStack.push(command)
    return nextState
  }

  redo(state: TState): TState {
    const command = this.redoStack.pop()
    if (!command) {
      return state
    }

    const nextState = command.execute(state)
    this.undoStack.push(command)
    return nextState
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }
}

export class AddComponentCommand implements Command<Project> {
  constructor(private readonly component: ComponentInstance) {}

  execute(state: Project): Project {
    return addComponent(state, this.component)
  }

  undo(state: Project): Project {
    return removeComponent(state, this.component.id)
  }
}

export class MoveComponentCommand implements Command<Project> {
  private previousTransform: Transform | null = null

  constructor(
    private readonly componentId: string,
    private readonly nextTransform: Partial<Transform>,
  ) {}

  execute(state: Project): Project {
    const component = state.diagram.components.find((item) => item.id === this.componentId)
    if (!component) {
      return state
    }

    this.previousTransform = component.transform
    return moveComponent(state, this.componentId, this.nextTransform)
  }

  undo(state: Project): Project {
    if (!this.previousTransform) {
      return state
    }

    return moveComponent(state, this.componentId, this.previousTransform)
  }
}

export class DeleteComponentCommand implements Command<Project> {
  private removedComponent: ComponentInstance | null = null
  private removedConnections: Connection[] = []

  constructor(private readonly componentId: string) {}

  execute(state: Project): Project {
    const component = state.diagram.components.find((item) => item.id === this.componentId)
    if (!component) {
      return state
    }

    this.removedComponent = component
    this.removedConnections = state.diagram.connections.filter(
      (connection) =>
        connection.from.componentId === this.componentId || connection.to.componentId === this.componentId,
    )

    return removeComponent(state, this.componentId)
  }

  undo(state: Project): Project {
    if (!this.removedComponent) {
      return state
    }

    return {
      ...state,
      diagram: {
        components: [...state.diagram.components, this.removedComponent],
        connections: [...state.diagram.connections, ...this.removedConnections],
      },
    }
  }
}
