/**
 * SPLASH — the mark zooms THROUGH the camera
 * ==========================================
 * The motion is lifted from the portfolio's intro "T": pure scale, no
 * translate. Translating reads as "sliding away"; scaling reads as depth, so
 * the letter rushes past the viewer and you fall through it into the app.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THE BLANK-SCREEN BUG THIS FILE USED TO HAVE — worth understanding, because
 * it's a classic React trap.
 *
 * The handover used to be a timer:
 *
 *     useEffect(() => {
 *       const t = setTimeout(onEnter, 1530)
 *       return () => clearTimeout(t)
 *     }, [phase, onEnter])
 *
 * `onEnter` was written inline in App as `() => setScreen('capture')`, so it
 * was a BRAND NEW FUNCTION on every single render of App. That made it a
 * changing dependency: every time App re-rendered for any unrelated reason,
 * the effect tore down and re-scheduled the timer from zero.
 *
 * App re-renders while the splash is playing (the always-mounted pomodoro
 * reports its state up, autosave runs, the mouse moves). So the countdown kept
 * restarting. Sometimes it landed late — "it takes a while". Sometimes it never
 * landed at all, and since the mark had already animated to opacity 0 with
 * `forwards`, you were left looking at an empty background. That's the bug.
 *
 * THE FIX — don't time the animation, LISTEN to it.
 * `onAnimationEnd` fires when the CSS animation genuinely finishes. There is no
 * second source of truth to drift out of sync, and re-renders cannot disturb
 * it. As a rule: if you're using setTimeout to guess when an animation ends,
 * you almost always want the animation's own event instead.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import PDMark from './PDMark'

export default function Splash({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false)

  return (
    <button
      onClick={() => !leaving && setLeaving(true)}
      aria-label="Enter"
      className="splash-stage"
    >
      <PDMark
        size={300}
        className={leaving ? 'pd-through' : 'pd-in'}
        // Only the zoom hands over. The arrival animation also fires this, so
        // we check which one finished before acting.
        onAnimationEnd={(e) => {
          if (e.animationName === 'pdThrough') onEnter()
        }}
      />
    </button>
  )
}
