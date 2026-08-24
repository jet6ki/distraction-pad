/**
 * POMODORO — a real timer
 * =======================
 *
 * THE LAYOUT BUG THIS FILE USED TO HAVE:
 * The column was `justify-between` inside a fixed-height box, with a 200px
 * dial. Total content was taller than the box, and `justify-between` happily
 * pushes overflow out of BOTH ends — so the dial escaped out the top and the
 * wheels hung out of the bottom. Fixed by shrinking the dial, using
 * `justify-center` with explicit gaps, and clipping the host.
 * Lesson: `justify-between` only behaves when the content is SHORTER than the
 * container. If it might not be, centre it and control the gaps yourself.
 *
 * THE COUNTDOWN:
 * `setInterval` ticks four times a second but the remaining time is computed
 * from a stored END TIMESTAMP, not by decrementing a counter. Intervals drift
 * and browsers throttle them hard in background tabs; comparing against the
 * real clock stays accurate regardless.
 *
 * THE SESSION LOOP:
 * work → break → work → break … for the chosen rounds, then done.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Wheel from './Wheel'

const WORK = [5, 10, 15, 20, 25, 30, 45]
const ROUNDS = [1, 2, 3, 4, 5, 6]
const BREAK = [1, 2, 3, 5, 10, 15]

export type PomodoroState = {
  running: boolean
  phase: 'work' | 'break' | 'done'
  remaining: number
  round: number
  rounds: number
}

export default function Pomodoro({
  onStateChange,
}: {
  onStateChange?: (s: PomodoroState) => void
}) {
  const [work, setWork] = useState(15)
  const [rounds, setRounds] = useState(2)
  const [brk, setBrk] = useState(2)

  const [phase, setPhase] = useState<'work' | 'break' | 'done'>('work')
  const [round, setRound] = useState(1)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(work * 60)

  const endAt = useRef<number | null>(null)

  const phaseLength = useMemo(
    () => (phase === 'break' ? brk * 60 : work * 60),
    [phase, brk, work],
  )

  /**
   * Re-arm the clock ONLY when the chosen duration actually changes.
   *
   * THE BUG THIS REPLACES: the old version was
   *     if (!running) setRemaining(phaseLength)
   * with `running` in the dependency list. Hitting Pause flips `running` to
   * false, which re-ran the effect, which reset the clock to full — so Pause
   * behaved like Reset. Comparing against the previous value in a ref means
   * only a genuine settings change re-arms it. Pause is now purely a pause.
   */
  const lastLength = useRef(phaseLength)
  useEffect(() => {
    if (phaseLength === lastLength.current) return
    lastLength.current = phaseLength
    if (!running) setRemaining(phaseLength)
  }, [phaseLength, running])

  useEffect(() => {
    if (!running) return
    endAt.current = Date.now() + remaining * 1000

    const id = window.setInterval(() => {
      if (endAt.current == null) return
      const left = Math.max(0, Math.round((endAt.current - Date.now()) / 1000))
      setRemaining(left)
      if (left > 0) return

      if (phase === 'work') {
        if (round >= rounds) {
          setPhase('done')
          setRunning(false)
        } else {
          setPhase('break')
        }
      } else {
        setRound((r) => r + 1)
        setPhase('work')
      }
    }, 250)

    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, round, rounds])

  useEffect(() => {
    if (phase === 'done') return
    setRemaining(phaseLength)
    if (running) endAt.current = Date.now() + phaseLength * 1000
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    onStateChange?.({ running, phase, remaining, round, rounds })
  }, [running, phase, remaining, round, rounds, onStateChange])

  function reset() {
    setRunning(false)
    setPhase('work')
    setRound(1)
    setRemaining(work * 60)
  }

  const progress = phaseLength > 0 ? 1 - remaining / phaseLength : 0
  const angle = progress * 360 - 90
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const R = 44
  const C = 2 * Math.PI * R

  return (
    <div className="pom-root">
      {/* The digital readout sits ABOVE the dial. The dial itself is purely
          analog — hand plus progress arc, no numbers inside it. */}
      <div className="pom-digital">
        <span className="pom-time">{phase === 'done' ? '00:00' : `${mm}:${ss}`}</span>
        <span className="pom-phase">
          {phase === 'done' ? 'session complete' : `${phase} · round ${round} of ${rounds}`}
        </span>
      </div>

      <button
        className="pom-dial"
        onClick={() => phase !== 'done' && setRunning((r) => !r)}
        aria-label={running ? 'Pause' : 'Start'}
      >
        <svg viewBox="0 0 100 100" className="pom-face">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(0 0 0 / 0.09)" strokeWidth="2.5" />
          {/* twelve ticks — what makes it read as a clock rather than a gauge */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 - 90) * (Math.PI / 180)
            const inner = i % 3 === 0 ? 35 : 38
            return (
              <line
                key={i}
                x1={50 + inner * Math.cos(a)}
                y1={50 + inner * Math.sin(a)}
                x2={50 + 41 * Math.cos(a)}
                y2={50 + 41 * Math.sin(a)}
                stroke={i % 3 === 0 ? 'rgb(0 0 0 / 0.38)' : 'rgb(0 0 0 / 0.18)'}
                strokeWidth={i % 3 === 0 ? 1.4 : 0.9}
                strokeLinecap="round"
              />
            )
          })}
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#1F7A5C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${progress * C} ${C}`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 260ms linear' }}
          />
          {/* The dial is analog-only now, so the hand can run from the centre
              pivot the way a real clock hand does. */}
          <circle cx="50" cy="50" r="2.2" fill="#1b1b1b" />
          <line
            x1="50"
            y1="50"
            x2={50 + 33 * Math.cos((angle * Math.PI) / 180)}
            y2={50 + 33 * Math.sin((angle * Math.PI) / 180)}
            stroke="#1b1b1b"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="pom-actions">
        <button onClick={() => setRunning((r) => !r)} disabled={phase === 'done'}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="pom-wheels">
        <Wheel label="Work Duration" values={WORK} value={work} onPick={setWork} />
        <Wheel label="Rounds" values={ROUNDS} value={rounds} onPick={setRounds} />
        <Wheel label="Break Duration" values={BREAK} value={brk} onPick={setBrk} />
      </div>
    </div>
  )
}
