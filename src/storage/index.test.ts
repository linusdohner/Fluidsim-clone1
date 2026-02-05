import { describe, expect, it } from 'vitest'
import { createEmptyProject } from '../domain'
import {
  PROJECT_SCHEMA_VERSION,
  deserializeProject,
  serializeProject,
} from './index'

describe('storage serialization', () => {
  it('serializes and deserializes project payloads', () => {
    const project = {
      ...createEmptyProject({ name: 'Demo Project' }, '1.2.3'),
      diagram: {
        components: [
          {
            id: 'cmp-1',
            type: 'Valve',
            transform: { x: 12, y: 34, rot: 0, flipH: false, flipV: false },
            parameterValues: { pressure: 5 },
          },
        ],
        connections: [],
      },
    }

    const json = serializeProject(project)
    const parsed = deserializeProject(json)

    expect(parsed).toEqual(project)
  })

  it('rejects payloads that miss schemaVersion', () => {
    expect(() => deserializeProject(JSON.stringify({ project: createEmptyProject() }))).toThrow(
      'Missing schemaVersion',
    )
  })

  it('keeps migration stub behavior for older versions', () => {
    const legacyProject = createEmptyProject({ migratedFrom: '0' }, '0.0.9')
    const payload = JSON.stringify({
      schemaVersion: PROJECT_SCHEMA_VERSION - 1,
      project: legacyProject,
    })

    const parsed = deserializeProject(payload)
    expect(parsed).toEqual(legacyProject)
  })
})
