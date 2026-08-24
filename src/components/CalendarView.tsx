/**
 * CALENDAR
 * ========
 * A month grid. Anything with a date lands in its day cell.
 *
 * THE BORDER PROBLEM THIS FILE USED TO HAVE:
 * Every cell carried `border-right` and `border-bottom`. That draws a line on
 * the outside edge of the last column and under the last row too, so the grid
 * read as a boxed-in table pressed against the panel edges. The Figma has only
 * INTERNAL separators — no outer frame.
 *
 * The fix is `:nth-child(7n)` to drop the right border on every seventh cell,
 * and `:nth-last-child(-n+7)` to drop the bottom border on the final row. The
 * grid is also inset from the panel edges so it breathes, as in the prototype.
 *
 * THE OTHER BUG: long event text ran straight through the next column. A grid
 * item's default minimum size is its content, so `text-overflow: ellipsis`
 * never kicked in. `min-width: 0` on the cell is what lets it shrink and clip —
 * the same fix the portfolio's marquee needed.
 *
 * HOW THE GRID IS BUILT:
 * `new Date(y, m + 1, 0).getDate()` gives the number of days in a month (day 0
 * of the next month is the last day of this one). `getDay()` on the 1st says
 * how many blanks to put before it. That's the whole algorithm — no date
 * library needed.
 */

import { blocksForDay, type Pad } from '../lib/model'
import { CalendarOff, Expand, Minimise } from './icons'

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type Props = {
  pads: Pad[]
  /** which month to show, as a Date anywhere inside it */
  cursor: Date
  dense: boolean
  onPickDay: (day: string) => void
  /** back to the pad — the calendar button, flipped */
  onCalendar: () => void
  onToggleSize: () => void
}

export default function CalendarView({
  pads,
  cursor,
  dense,
  onPickDay,
  onCalendar,
  onToggleSize,
}: Props) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = new Date(year, month, 1).getDay()

  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const key = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="cal-root">
      <h2 className={dense ? 'cal-title cal-title-dense' : 'cal-title'}>
        {dense ? (
          <>
            {MONTHS[month]}
            <br />
            {year}
          </>
        ) : (
          `${MONTHS[month]} ${year}`
        )}
      </h2>

      <div className="cal-frame">
        <div className="cal-dow">
          {DOW.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <span key={i} className="cal-cell cal-cell-empty" />
            const k = key(d)
            const items = blocksForDay(pads, k)
            return (
              <button
                key={i}
                className={k === todayKey ? 'cal-cell is-today' : 'cal-cell'}
                onClick={() => onPickDay(k)}
              >
                <span className="cal-num">{d}</span>
                {/* Fullscreen has room for the text; the small size just marks
                    that something is there. */}
                {!dense &&
                  items.slice(0, 3).map((b) => (
                    <span key={b.id} className="cal-item">
                      <span className="cal-bullet">•</span>
                      {b.text}
                    </span>
                  ))}
                {!dense && items.length > 3 && (
                  <span className="cal-more">+{items.length - 3} more</span>
                )}
                {dense && items.length > 0 && <span className="cal-dot" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="pad-footer">
        <button className="pad-corner" onClick={onCalendar} aria-label="Back to pad">
          <CalendarOff />
        </button>
        <span className="pad-date" />
        <button
          className="pad-corner"
          onClick={onToggleSize}
          aria-label={dense ? 'Expand to fullscreen' : 'Minimise'}
        >
          {dense ? <Expand /> : <Minimise />}
        </button>
      </div>
    </div>
  )
}
