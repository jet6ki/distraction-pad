/**
 * THE WHEEL — one scrollable picker, used everywhere
 * ==================================================
 * The pomodoro's three columns and the time picker in the date popover are all
 * this component. One implementation means they scroll identically and can't
 * drift apart as the app grows.
 *
 * HOW IT WORKS — the browser does the hard part:
 *   scroll-snap-type: y mandatory   → a scroll always lands ON a value
 *   scroll-snap-align: center       → the value parks in the middle
 *   padding rows top and bottom     → lets the first/last item reach centre
 *
 * We only listen for `scroll`, divide scrollTop by the row height to find which
 * item is centred, and report it. The browser supplies the momentum, the
 * rubber-banding and the touch handling for free. Hand-rolling drag maths would
 * be ten times the code and worse on a trackpad.
 *
 * WHY WE WAIT BEFORE COMMITTING (the `settle` timer):
 * `scroll` fires on every frame of a flick — dozens of times. Committing on
 * each one would re-render the whole app dozens of times and fight the user's
 * momentum. Waiting ~90ms of stillness means we commit once, at rest. This is
 * called debouncing and it's the single most useful trick for scroll and
 * keystroke handlers.
 */

import { useEffect, useRef } from 'react'

export const WHEEL_ROW = 30 // px per row — must match .wheel-item height in CSS

type Props = {
  label?: string
  values: number[]
  value: number
  onPick: (n: number) => void
  /** e.g. pad hours to "07" */
  format?: (n: number) => string
  className?: string
}

export default function Wheel({ label, values, value, onPick, format, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const settle = useRef<number | null>(null)

  // Park on the current value when the wheel first appears, and whenever the
  // value changes from outside (e.g. Reset).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const i = values.indexOf(value)
    if (i < 0) return
    const target = i * WHEEL_ROW
    if (Math.abs(el.scrollTop - target) > 2) el.scrollTop = target
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function onScroll() {
    if (settle.current) window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      const el = ref.current
      if (!el) return
      const i = Math.round(el.scrollTop / WHEEL_ROW)
      const next = values[Math.max(0, Math.min(values.length - 1, i))]
      if (next !== undefined && next !== value) onPick(next)
    }, 90)
  }

  return (
    <div className={['wheel-col', className].filter(Boolean).join(' ')}>
      {label && <div className="pom-label">{label}</div>}
      <div className="wheel" ref={ref} onScroll={onScroll} tabIndex={0}>
        <div className="wheel-pad" aria-hidden="true" />
        {values.map((n) => (
          <button
            key={n}
            type="button"
            className={n === value ? 'wheel-item is-on' : 'wheel-item'}
            onClick={() => {
              onPick(n)
              ref.current?.scrollTo({ top: values.indexOf(n) * WHEEL_ROW, behavior: 'smooth' })
            }}
          >
            {format ? format(n) : n}
          </button>
        ))}
        <div className="wheel-pad" aria-hidden="true" />
      </div>
    </div>
  )
}
