/**
 * THE DATA MODEL
 * ==============
 * One pad per day. Blocks live inside it. There is no "create note" event —
 * which is the whole reason nothing can get lost.
 *
 * Everything the app knows how to store is described here, in one file. If you
 * want to add a feature that remembers something new, this is where you start.
 */

export { longDate, longDayLabel } from './date'

/** The three kinds of line you can write. */
export type BlockType = 'text' | 'task' | 'event'

export type Block = {
  id: string
  type: BlockType
  text: string

  /** tasks only — ticked or not */
  done?: boolean

  /** tasks and events: which day it belongs to, as "YYYY-MM-DD" */
  date?: string

  /** tasks: the single time it happens, as "HH:mm" */
  time?: string

  /** events: they run from a start to an end, so they get two times */
  startTime?: string
  endTime?: string

  /**
   * A short note attached to a task or event — the Apple Reminders idea.
   * Renders under the line in the same typeface, smaller and dimmer, so it
   * reads as subordinate detail rather than another item in the list.
   */
  note?: string
}

export type Pad = {
  id: string
  /** YYYY-MM-DD — the day this pad belongs to */
  day: string
  /** the heading the user typed at the top; null until they name it */
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
 * THE TYPED PREFIXES
 * Detected as you type and stripped immediately, so you are never left looking
 * at your own markup.
 *   "- " → task     "/ " → event
 */
export function detectPrefix(value: string): { type: BlockType; text: string } | null {
  if (value.startsWith('- ')) return { type: 'task', text: value.slice(2) }
  if (value.startsWith('/ ')) return { type: 'event', text: value.slice(2) }
  return null
}

/**
 * Turn a block back into a plain note WITHOUT losing what was typed.
 * This is the "I didn't mean to make that a task" escape hatch: clicking the
 * checkbox off, or the bullet off, calls this. The text survives; only the
 * type and its scheduling fields go.
 */
export function stripType(block: Block): Block {
  // Note and scheduling both belong to the typed form, so they go with it.
  return { id: block.id, type: 'text', text: block.text }
}

/** Change a block's type in place, keeping the text. */
export function retype(block: Block, type: BlockType): Block {
  const base: Block = { id: block.id, type, text: block.text }
  if (type === 'task') base.done = false
  return base
}

/** First block is the pad's heading; falls back to the date. */
export function padTitle(pad: Pad): string {
  const first = pad.blocks[0]?.text.trim()
  if (first) return first
  if (pad.name) return pad.name
  return 'Untitled Note'
}

/** Anything dated, for the calendar and for the pull-forward prompt. */
export function datedBlocks(pads: Pad[]): Array<Block & { day: string }> {
  return pads.flatMap((p) => p.blocks.filter((b) => b.date).map((b) => ({ ...b, day: p.day })))
}

/**
 * Everything scheduled on one specific day, for a calendar cell.
 * A block counts if it carries that date explicitly, OR if it lives in that
 * day's pad and has no date of its own.
 */
export function blocksForDay(pads: Pad[], day: string): Block[] {
  const out: Block[] = []
  for (const p of pads) {
    for (const b of p.blocks) {
      if (b.type === 'text' || !b.text.trim()) continue
      if (b.date ? b.date === day : p.day === day) out.push(b)
    }
  }
  return out
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
