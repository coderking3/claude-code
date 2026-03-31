export interface CachedMCState {
  pinnedEdits: PinnedCacheEdits[]
}

export interface CacheEditsBlock {
  type: string
  edits: unknown[]
}

export interface PinnedCacheEdits {
  userMessageIndex: number
  block: CacheEditsBlock
}

export function createCachedMCState(): CachedMCState {
  return { pinnedEdits: [] }
}

export function isCachedMicrocompactEnabled(): boolean {
  return false
}

export function isModelSupportedForCacheEditing(_model: string): boolean {
  return false
}

export function getCachedMCConfig(): unknown {
  return null
}
