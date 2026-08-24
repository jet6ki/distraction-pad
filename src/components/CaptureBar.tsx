/**
 * THE CAPTURE BAR
 * ===============
 * Two modes in one element.
 *
 *  IDLE   a wide glass pill that is a BUTTON reading "what's on your mind?",
 *         with the AI dot beside it. Pressing the bar opens the notepad.
 *
 *  ASK    pressing the AI dot makes the bar stretch wider while the dot slides
 *         inward, shrinks and dissolves into it. The bar then becomes a real
 *         text field for asking the assistant things.
 *
 * WHY A BUTTON AND NOT A TEXT FIELD IN IDLE:
 * Typing into a field and having a whole notepad erupt underneath was a lie
 * about what the field was for — it looked like search and behaved like a door.
 * A button that says "what's on your mind?" is honest: press it, you get a page
 * to write on.
 *
 * HOW THE MORPH IS DONE:
 * Both modes render the same pill geometry and only the class changes, so the
 * browser tweens width, radius and padding between them. The dot is a separate
 * element transitioning its own transform and opacity on the SAME curve and
 * duration. Two things moving on one shared timing reads as a single object
 * rearranging itself — that's the whole trick behind a convincing morph.
 */

import { useEffect, useRef, useState } from 'react'
import { Sparkle } from './icons'

type Props = {
  /** open the notepad */
  onOpenPad: () => void
  /** ask the assistant something (not wired to a model yet) */
  onAsk?: (question: string) => void
}

export default function CaptureBar({ onOpenPad, onAsk }: Props) {
  const [asking, setAsking] = useState(false)
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (asking) input.current?.focus()
  }, [asking])

  function leaveAsk() {
    setAsking(false)
    setQ('')
  }

  return (
    <div className="capture-stage">
      <div className={asking ? 'capture-row is-asking' : 'capture-row'}>
        {asking ? (
          <input
            ref={input}
            className="capture-bar capture-bar-input"
            placeholder="ask anything — what's left this week, find that note…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') leaveAsk()
              if (e.key === 'Enter' && q.trim()) onAsk?.(q.trim())
            }}
            onBlur={() => !q.trim() && leaveAsk()}
          />
        ) : (
          <button className="capture-bar capture-bar-button" onClick={onOpenPad}>
            what&rsquo;s on your mind?
          </button>
        )}

        {/* The dot slides inward and dissolves rather than simply vanishing —
            it should look absorbed by the bar, not deleted. */}
        <button
          className={asking ? 'capture-dot is-absorbed' : 'capture-dot'}
          onClick={() => setAsking(true)}
          aria-label="Ask AI"
          title="Ask AI"
          tabIndex={asking ? -1 : 0}
        >
          <Sparkle />
        </button>
      </div>

      {asking && <p className="capture-hint">the assistant lands in v1.0 — esc to go back</p>}
    </div>
  )
}
