import { type Pad } from './model'

const KEY = 'distraction-pad/pads/v1'

/**
 * localStorage for now. v0.5 swaps this file's two functions for API calls —
 * everything else in the app talks to these, not to storage directly.
 */
export function loadPads(): Pad[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Pad[]) : []
  } catch {
    return []
  }
}

export function savePads(pads: Pad[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(pads))
  } catch {
    // quota or private mode — the app keeps working in memory
  }
}
