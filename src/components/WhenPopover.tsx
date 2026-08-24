/**
 * THE "WHEN" POPOVER
 * ==================
 * Notion's shape — a floating month grid plus a couple of toggles — but wearing
 * this app's clothes: frosted glass, the brand green as the accent, no blue.
 *
 * WHY THE TIME PICKER IS OURS AND NOT <input type="time">:
 * A native time input opens the operating system's own picker — a big white
 * dropdown we cannot style, position or theme. It looked like it belonged to a
 * different program, because it does. Swapping it for two Wheels (the same
 * component the pomodoro uses) keeps everything inside our design and reuses
 * code we already trust.
 *
 * CLOSING ON OUTSIDE CLICK:
 * A `mousedown` listener on the document checks whether the click landed inside
 * our box; if not, close. On mousedown rather than click so the popover closes
 * before whatever is underneath can fire.
 */

import { useEffect, useRef, useState } from 'react'
import Wheel from './Wheel'
import type { Block, BlockType } from '../lib/model'

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5) // 5-minute steps
const pad2 = (n: number) => String(n).padStart(2, '0')

type Props = {
  block: Block
  type: BlockType
  onChange: (patch: Partial<Block>) => void
  onClose: () => void
}

const keyOf = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`

/** "09:30" → { h: 9, m: 30 }, with a sane default. */
function parse(t?: string) {
  if (!t) return { h: 9, m: 0 }
  const [h, m] = t.split(':').map(Number)
  return { h: h ?? 9, m: m ?? 0 }
}

/** A labelled hour:minute pair built from two Wheels. */
function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (t: string) => void
}) {
  const { h, m } = parse(value)
  return (
    <div className="when-time">
      <span className="when-time-label">{label}</span>
      <div className="when-time-wheels">
        <Wheel values={HOURS} value={h} format={pad2} onPick={(n) => onChange(`${pad2(n)}:${pad2(m)}`)} />
        <span className="when-time-colon">:</span>
        <Wheel values={MINUTES} value={m} format={pad2} onPick={(n) => onChange(`${pad2(h)}:${pad2(n)}`)} />
      </div>
    </div>
  )
}

export default function WhenPopover({ block, type, onChange, onClose }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const initial = block.date ? new Date(block.date + 'T00:00:00') : new Date()
  const [view, setView] = useState(initial)
  const [includeTime, setIncludeTime] = useState(Boolean(block.time || block.startTime))
  const [hasEnd, setHasEnd] = useState(Boolean(block.endTime))

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [onClose])

  const y = view.getFullYear()
  const m = view.getMonth()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const leading = new Date(y, m, 1).getDay()
  const now = new Date()
  const todayKey = keyOf(now.getFullYear(), now.getMonth(), now.getDate())

  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div ref={box} className="when-pop glass" role="dialog" aria-label="Set date and time">
      <div className="when-pop-head">
        <span className="when-pop-month">
          {MONTHS[m]} {y}
        </span>
        <div className="when-pop-nav">
          <button onClick={() => setView(new Date())} className="when-pop-today">
            Today
          </button>
          <button onClick={() => setView(new Date(y, m - 1, 1))} aria-label="Previous month">
            ‹
          </button>
          <button onClick={() => setView(new Date(y, m + 1, 1))} aria-label="Next month">
            ›
          </button>
        </div>
      </div>

      <div className="when-pop-dow">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="when-pop-grid">
        {cells.map((d, i) =>
          d === null ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => onChange({ date: keyOf(y, m, d) })}
              className={[
                'when-pop-day',
                block.date === keyOf(y, m, d) ? 'is-picked' : '',
                todayKey === keyOf(y, m, d) ? 'is-today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {d}
            </button>
          ),
        )}
      </div>

      <div className="when-pop-rows">
        <button
          className="when-pop-row"
          onClick={() => {
            const next = !includeTime
            setIncludeTime(next)
            if (!next) onChange({ time: undefined, startTime: undefined, endTime: undefined })
            else if (type === 'task') onChange({ time: '09:00' })
            else onChange({ startTime: '09:00' })
          }}
        >
          <span>Include time</span>
          <span className={includeTime ? 'when-switch is-on' : 'when-switch'} />
        </button>

        {includeTime && type === 'task' && (
          <TimeField label="At" value={block.time} onChange={(t) => onChange({ time: t })} />
        )}

        {includeTime && type === 'event' && (
          <>
            <TimeField
              label="Start"
              value={block.startTime}
              onChange={(t) => onChange({ startTime: t })}
            />
            <button
              className="when-pop-row"
              onClick={() => {
                const next = !hasEnd
                setHasEnd(next)
                onChange({ endTime: next ? '10:00' : undefined })
              }}
            >
              <span>End time</span>
              <span className={hasEnd ? 'when-switch is-on' : 'when-switch'} />
            </button>
            {hasEnd && (
              <TimeField
                label="End"
                value={block.endTime}
                onChange={(t) => onChange({ endTime: t })}
              />
            )}
          </>
        )}
      </div>

      <button
        className="when-pop-clear"
        onClick={() => {
          onChange({ date: undefined, time: undefined, startTime: undefined, endTime: undefined })
          onClose()
        }}
      >
        Clear
      </button>
    </div>
  )
}
