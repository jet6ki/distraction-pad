/**
 * THE NOTEPAD
 * ===========
 * A live surface, not a form. There is no submit — what you type is already
 * saved. Enter opens a new line, Backspace on an empty line removes it.
 *
 * The bottom bar carries the three things the Figma shows:
 *   calendar+ (left) · the date (centre) · expand or minimise (right)
 */

import { useState } from 'react'
import BlockRow from './BlockRow'
import { CalendarPlus, Expand, Minimise } from './icons'
import { emptyBlock, longDate, type Block, type Pad as PadModel } from '../lib/model'

type Props = {
  pad: PadModel
  fullscreen: boolean
  onChange: (next: PadModel) => void
  onTyping: () => void
  onCalendar: () => void
  onToggleSize: () => void
}

export default function PadPanel({
  pad,
  fullscreen,
  onChange,
  onTyping,
  onCalendar,
  onToggleSize,
}: Props) {
  const [focus, setFocus] = useState(0)

  function setBlocks(blocks: Block[]) {
    onChange({ ...pad, blocks })
  }

  function patch(i: number, p: Partial<Block>) {
    onTyping()
    const next = pad.blocks.slice()
    next[i] = { ...next[i], ...p }
    setBlocks(next)
  }

  /** Wholesale swap — used when a block changes type and should lose fields. */
  function replace(i: number, block: Block) {
    const next = pad.blocks.slice()
    next[i] = block
    setBlocks(next)
  }

  function addAfter(i: number) {
    const next = pad.blocks.slice()
    next.splice(i + 1, 0, emptyBlock())
    setBlocks(next)
    setFocus(i + 1)
  }

  function removeAt(i: number) {
    if (pad.blocks.length === 1) return
    const next = pad.blocks.slice()
    next.splice(i, 1)
    setBlocks(next)
    setFocus(Math.max(0, i - 1))
  }

  const [y, m, d] = pad.day.split('-').map(Number)
  const dateLabel = longDate(new Date(y, (m ?? 1) - 1, d ?? 1))

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {pad.blocks.map((b, i) => (
          <BlockRow
            key={b.id}
            block={b}
            index={i}
            focused={focus === i}
            onFocus={() => setFocus(i)}
            onChange={(p) => patch(i, p)}
            onReplace={(nb) => replace(i, nb)}
            onEnter={() => addAfter(i)}
            onBackspaceEmpty={() => removeAt(i)}
          />
        ))}
      </div>

      <div className="pad-footer">
        <button className="pad-corner" onClick={onCalendar} aria-label="Open calendar">
          <CalendarPlus />
        </button>

        <span className="pad-date">{dateLabel}</span>

        <button
          className="pad-corner"
          onClick={onToggleSize}
          aria-label={fullscreen ? 'Minimise' : 'Expand to fullscreen'}
        >
          {fullscreen ? <Minimise /> : <Expand />}
        </button>
      </div>
    </div>
  )
}
