/**
 * One pad per day. Blocks live inside it. There is no "create note" event —
 * which is the whole reason nothing can get lost.
 */

export { longDate, longDayLabel } from './date'

export type BlockType = 'text' | 'task' | 'event'

export type Block = {
  id: string
  type: BlockType
  text: string
  /** tasks only */
  done?: boolean
  /** tasks and events: ISO date, optional time as HH:mm */
  date?: string
  time?: string
}

export type Pad = {
  id: string
  /** YYYY-MM-DD — the day this pad belongs to */
  day: string
  /** null for the day's default pad, a name for extra pads on the same day */
  name: string | null
  blocks: Block[]
  updatedAt: string
}

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function emptyBlock(type: BlockType = 'text'): Block {
  return { id: uid(), type, text: '', ...(type === 'task' ? { done: false } : {}) }
}

export function newPad(day = dayKey(), name: string | null = null): Pad {
  return { id: uid(), day, name, blocks: [emptyBlock()], updatedAt: new Date().toISOString() }
}

/**
 * The typed prefixes. Detected as you type and stripped immediately, so you're
 * never left looking at your own markup.
 *   "- " → task     "/ " → event
 */
export function detectPrefix(value: string): { type: BlockType; text: string } | null {
  if (value.startsWith('- ')) return { type: 'task', text: value.slice(2) }
  if (value.startsWith('/ ')) return { type: 'event', text: value.slice(2) }
  return null
}

/** Unticked tasks sitting on days before `day` — they stay put until pulled. */
export function unfinishedBefore(pads: Pad[], day: string): Array<Block & { padId: string }> {
  return pads
    .filter((p) => p.day < day)
    .flatMap((p) =>
      p.blocks
        .filter((b) => b.type === 'task' && !b.done && b.text.trim())
        .map((b) => ({ ...b, padId: p.id })),
    )
}
