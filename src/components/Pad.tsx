import { useState } from 'react'
import BlockRow from './BlockRow'
import { CalendarView, Expand, Close } from './icons'
import { emptyBlock, longDayLabel, type Block, type Pad as PadModel } from '../lib/model'

type Props = {
  pad: PadModel
  expanded: boolean
  unfinishedCount: number
  onChange: (pad: PadModel) => void
  onToggleExpand: () => void
  onSwitchView: () => void
  onPullForward: () => void
}

/**
 * The day's pad. A live surface, not a form: every keystroke is the document.
 * Enter opens a new line, Backspace on an empty line removes it.
 */
export default function Pad({
  pad,
  expanded,
  unfinishedCount,
  onChange,
  onToggleExpand,
  onSwitchView,
  onPullForward,
}: Props) {
  const [focusIndex, setFocusIndex] = useState(0)

  function patchBlock(i: number, patch: Partial<Block>) {
    const blocks = pad.blocks.map((b, bi) => (bi === i ? { ...b, ...patch } : b))
    onChange({ ...pad, blocks, updatedAt: new Date().toISOString() })
  }

  function insertAfter(i: number) {
    const blocks = [...pad.blocks]
    blocks.splice(i + 1, 0, emptyBlock())
    onChange({ ...pad, blocks, updatedAt: new Date().toISOString() })
    setFocusIndex(i + 1)
  }

  function removeAt(i: number) {
    if (pad.blocks.length === 1) return
    const blocks = pad.blocks.filter((_, bi) => bi !== i)
    onChange({ ...pad, blocks, updatedAt: new Date().toISOString() })
    setFocusIndex(Math.max(0, i - 1))
  }

  return (
    <article
      className={[
        'glass flex flex-col rounded-[22px] transition-all duration-700 ease-pad',
        expanded
          ? 'h-[calc(100vh-104px)] w-[calc(100vw-210px)] p-10'
          : 'h-[430px] w-[min(88vw,560px)] p-7',
      ].join(' ')}
    >
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {pad.blocks.map((block, i) => (
          <BlockRow
            key={block.id}
            block={block}
            index={i}
            focused={focusIndex === i}
            onChange={(patch) => patchBlock(i, patch)}
            onEnter={() => insertAfter(i)}
            onBackspaceEmpty={() => removeAt(i)}
            onFocus={() => setFocusIndex(i)}
          />
        ))}
      </div>

      {unfinishedCount > 0 && (
        <button
          onClick={onPullForward}
          className="mt-3 self-start text-[11px] uppercase tracking-[0.14em] text-white/55 transition hover:text-white/90"
        >
          {unfinishedCount} unfinished from earlier — pull forward
        </button>
      )}

      <footer className="flex items-center justify-between pt-5">
        <button
          onClick={onSwitchView}
          aria-label="Switch to calendar"
          className="text-white/65 transition hover:text-white"
        >
          <CalendarView />
        </button>

        <span className="text-[12.5px] text-white/80">{longDayLabel(pad.day)}</span>

        <button
          onClick={onToggleExpand}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          className="text-white/65 transition hover:text-white"
        >
          {expanded ? <Close /> : <Expand />}
        </button>
      </footer>
    </article>
  )
}
