/**
 * THE THREE-BUTTON RAIL
 * =====================
 * back/sign-out · pomodoro · settings
 *
 * TWO BEHAVIOURS, DEPENDING ON WHERE YOU ARE:
 *  - Normal size: sits bottom-centre, slides away after 5 seconds of no
 *    activity, and slides back when the mouse enters its area.
 *  - Fullscreen: moves to the right edge and STAYS. No hiding.
 *
 * HOW THE AUTO-HIDE WORKS:
 * `setTimeout` schedules the hide. Any mouse movement inside the hover zone
 * cancels and restarts it. The zone is a taller invisible strip than the
 * buttons themselves, so you don't have to hit a small target to bring them
 * back — that's why there's a padded wrapper around the row.
 */

import { useEffect, useRef, useState } from 'react'
import { Back, Clock, Settings, SignIn } from './icons'
import { EASE, TIMING, railIsVertical, type Screen } from '../state/screens'

type Props = {
  screen: Screen
  /** true while the user is typing — forces an immediate hide, no 5s wait */
  suppressed: boolean
  onBack: () => void
  onPomodoro: () => void
  onSettings: () => void
}

export default function IconRail({ screen, suppressed, onBack, onPomodoro, onSettings }: Props) {
  const vertical = railIsVertical(screen)
  const [visible, setVisible] = useState(true)
  const timer = useRef<number | null>(null)

  function clear() {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
  }

  /** Restart the idle countdown. Fullscreen opts out — it never hides. */
  function poke() {
    clear()
    if (vertical || suppressed) return
    timer.current = window.setTimeout(() => setVisible(false), TIMING.railIdle)
  }

  useEffect(() => {
    if (vertical) {
      setVisible(true)
      clear()
      return
    }
    if (suppressed) {
      // Typing hides it at once — the spec is explicit that this skips the wait.
      setVisible(false)
      clear()
      return
    }
    setVisible(true)
    poke()
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, suppressed, vertical])

  // On the capture screen there is nowhere further back to go, so the same
  // slot becomes Sign out. Everywhere else it stays a back button.
  const isSignOut = screen === 'capture'

  const buttons = (
    <>
      <button
        className="icon-btn"
        onClick={onBack}
        aria-label={isSignOut ? 'Sign out' : 'Back'}
        title={isSignOut ? 'Sign out' : 'Back'}
      >
        {isSignOut ? <SignIn /> : <Back />}
      </button>
      <button className="icon-btn" onClick={onPomodoro} aria-label="Pomodoro timer">
        <Clock />
      </button>
      <button className="icon-btn" onClick={onSettings} aria-label="Settings">
        <Settings />
      </button>
    </>
  )

  if (vertical) {
    return (
      <nav
        aria-label="Pad controls"
        className="fixed right-8 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-6"
      >
        {buttons}
      </nav>
    )
  }

  return (
    // The hover zone is taller than the buttons so the rail is easy to summon.
    <div
      className="fixed bottom-0 left-1/2 z-30 -translate-x-1/2 px-16 pb-8 pt-16"
      onMouseEnter={() => {
        setVisible(true)
        poke()
      }}
      onMouseMove={poke}
    >
      <nav
        aria-label="Pad controls"
        className="flex gap-8"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(180%)',
          opacity: visible ? 1 : 0,
          transition: `transform ${TIMING.ui}ms ${EASE}, opacity ${TIMING.ui}ms ${EASE}`,
        }}
      >
        {buttons}
      </nav>
    </div>
  )
}
