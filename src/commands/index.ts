import { invoke } from '@tauri-apps/api/core'

export async function pingBackend(): Promise<string> {
  return invoke<string>('ping')
}
