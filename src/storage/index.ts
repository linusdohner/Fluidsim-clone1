import { appDataDir, join } from '@tauri-apps/api/path'
import { createEmptyProject, type Project } from '../domain'

export interface StorageAdapter {
  save: (key: string, payload: string) => Promise<void>
  load: (key: string) => Promise<string | null>
}

export const PROJECT_SCHEMA_VERSION = 1
const DEFAULT_FILE_NAME = 'project.json'
const AUTOSAVE_KEY = 'fluidsim:autosave:project'

interface PersistedProjectV1 {
  schemaVersion: number
  project: Project
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const serializeProject = (project: Project): string =>
  JSON.stringify({ schemaVersion: PROJECT_SCHEMA_VERSION, project }, null, 2)

const migrateProjectPayload = (payload: unknown): PersistedProjectV1 => {
  if (!isRecord(payload)) {
    throw new Error('Invalid project payload.')
  }

  const maybeVersion = payload.schemaVersion
  if (typeof maybeVersion !== 'number') {
    throw new Error('Missing schemaVersion in project payload.')
  }

  if (maybeVersion > PROJECT_SCHEMA_VERSION) {
    throw new Error(`Unsupported schema version: ${maybeVersion}.`)
  }

  // migration stub for future project versions
  if (maybeVersion < PROJECT_SCHEMA_VERSION) {
    return {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      project: migrateLegacyProject(payload),
    }
  }

  const project = payload.project
  if (!isValidProject(project)) {
    throw new Error('Project validation failed.')
  }

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    project,
  }
}

const migrateLegacyProject = (payload: Record<string, unknown>): Project => {
  if (isValidProject(payload.project)) {
    return payload.project
  }

  return createEmptyProject({ migrated: true })
}

export const deserializeProject = (json: string): Project => {
  const parsed = JSON.parse(json) as unknown
  const migratedPayload = migrateProjectPayload(parsed)
  return migratedPayload.project
}

const isValidProject = (value: unknown): value is Project => {
  if (!isRecord(value) || typeof value.version !== 'string' || !isRecord(value.metadata)) {
    return false
  }

  const diagram = value.diagram
  if (!isRecord(diagram) || !Array.isArray(diagram.components) || !Array.isArray(diagram.connections)) {
    return false
  }

  return true
}

const hasTauriRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return '__TAURI_INTERNALS__' in window || '__TAURI__' in window
}

const resolveFilePath = async (fileName: string): Promise<string> => {
  const root = await appDataDir()
  return join(root, fileName)
}

export const saveProjectToFile = async (
  project: Project,
  fileName = DEFAULT_FILE_NAME,
): Promise<string> => {
  const payload = serializeProject(project)

  if (hasTauriRuntime()) {
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')
    const filePath = await resolveFilePath(fileName)
    await writeTextFile(filePath, payload)
    return filePath
  }

  localStorage.setItem(fileName, payload)
  return fileName
}

export const loadProjectFromFile = async (fileName = DEFAULT_FILE_NAME): Promise<Project | null> => {
  if (hasTauriRuntime()) {
    const { exists, readTextFile } = await import('@tauri-apps/plugin-fs')
    const filePath = await resolveFilePath(fileName)
    const fileExists = await exists(filePath)

    if (!fileExists) {
      return null
    }

    const content = await readTextFile(filePath)
    return deserializeProject(content)
  }

  const localContent = localStorage.getItem(fileName)
  return localContent ? deserializeProject(localContent) : null
}

export const saveAutosave = (project: Project): void => {
  localStorage.setItem(AUTOSAVE_KEY, serializeProject(project))
}

export const loadAutosave = (): Project | null => {
  const payload = localStorage.getItem(AUTOSAVE_KEY)
  if (!payload) {
    return null
  }

  try {
    return deserializeProject(payload)
  } catch {
    localStorage.removeItem(AUTOSAVE_KEY)
    return null
  }
}

export const clearAutosave = (): void => {
  localStorage.removeItem(AUTOSAVE_KEY)
}

export const getAutosaveKey = (): string => AUTOSAVE_KEY
