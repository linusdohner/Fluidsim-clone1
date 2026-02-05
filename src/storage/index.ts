export interface StorageAdapter {
  save: (key: string, payload: string) => Promise<void>
  load: (key: string) => Promise<string | null>
}
