import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { detectPrefix, stripType, type Block } from '../lib/model'
import WhenPopover from './WhenPopover'

type Props = {
  block: Block
  index: number
  focused: boolean
  onChange: (patch: Partial<Block>) => void
  onReplace: (next: Block) => void
  onEnter: () => void
  onBackspaceEmpty: () => void
  onFocus: () => void
}

/**
 * ONE LINE OF THE PAD
 * ===================
 *
 * WORD WRAP — why this is a <textarea> and not an <input>:
 * `<input>` is single-line by definition. It never wraps; long text just
 * scrolls sideways forever. `<textarea>` wraps like a real editor. The catch is
 * that a textarea has a fixed height and its own scrollbar, which would look
 * wrong here — so we auto-grow it: on every change, reset the height to `auto`
 * then set it to `scrollHeight`. That makes it exactly as tall as its content,
 * and the line grows downward as you type. `resize: none` and
 * `overflow: hidden` in the CSS hide the usual textarea furniture.
 *
 * TYPED PREFIXES: "- " makes a task, "/ " makes an event, and the prefix is
 * eaten so you never see your own markup.
 *
 * UNDOING A CONVERSION WITHOUT LOSING TEXT — two ways, both in the spec:
 *  1. Backspace with the cursor at the very start of the line.
 *  2. Click the event bullet.
 * Both call `stripType`, keeping the text and dropping only the type.
 */
export default function BlockRow({
  block,
  index,
  focused,
  onChange,
  onReplace,
  onEnter,
  onBackspaceEmpty,
  onFocus,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const [showWhen, setShowWhen] = useState(false)
  // The note editor is open if there's already a note, or the user just asked
  // for one. Kept as state rather than derived so an empty note stays open
  // while you're typing into it.
  const [noteOpen, setNoteOpen] = useState(Boolean(block.note))
  const isHeading = index === 0
  const typed = block.type === 'task' || block.type === 'event'

  useEffect(() => {
    if (focused) ref.current?.focus()
  }, [focused])

  // Auto-grow. useLayoutEffect so the resize happens before the browser
  // paints — otherwise you see a one-frame flicker at the old height.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [block.text])

  // Same auto-grow trick as the main line — see the comment above.
  useLayoutEffect(() => {
    const el = noteRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [block.note, noteOpen])

  function handleChange(value: string) {
    const hit = block.type === 'text' ? detectPrefix(value) : null
    if (hit) {
      onChange({ type: hit.type, text: hit.text, ...(hit.type === 'task' ? { done: false } : {}) })
      return
    }
    onChange({ text: value })
  }

  /** "21 Aug · 09:00" style summary for the chip under a dated line. */
  function whenLabel(): string {
    if (!block.date) return 'when?'
    const [, mo, da] = block.date.split('-')
    const base = `${da}/${mo}`
    if (block.type === 'event') {
      if (block.startTime && block.endTime) return `${base} · ${block.startTime}–${block.endTime}`
      if (block.startTime) return `${base} · ${block.startTime}`
      return base
    }
    return block.time ? `${base} · ${block.time}` : base
  }

  return (
    <div className="group relative flex items-start gap-3">
      {/* task checkbox — toggles done. To remove task-ness, Backspace at start. */}
      {block.type === 'task' && (
        <button
          onClick={() => onChange({ done: !block.done })}
          aria-label={block.done ? 'Mark as not done' : 'Mark as done'}
          className={[
            'mt-[6px] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-[5px] border',
            'transition-all duration-200 ease-pad',
            block.done
              ? 'border-white/70 bg-white/70'
              : 'border-white/45 bg-transparent hover:border-white/80',
          ].join(' ')}
        >
          {block.done && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3A3A3A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </button>
      )}

      {/* event bullet — clicking it drops event-ness but keeps the text */}
      {block.type === 'event' && (
        <button
          onClick={() => onReplace(stripType(block))}
          aria-label="Remove event marker"
          title="Remove event marker"
          className="mt-[9px] h-[9px] w-[9px] shrink-0 rounded-full bg-ribbon-green transition hover:scale-125"
        />
      )}

      <div className="min-w-0 flex-1">
        <textarea
          ref={ref}
          rows={1}
          value={block.text}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onEnter()
              return
            }
            if (e.key === 'Backspace') {
              const atStart =
                ref.current?.selectionStart === 0 && ref.current?.selectionEnd === 0
              if (typed && atStart) {
                e.preventDefault()
                onReplace(stripType(block))
                return
              }
              if (block.text === '') {
                e.preventDefault()
                onBackspaceEmpty()
              }
            }
          }}
          placeholder={isHeading ? 'Untitled Note' : ''}
          className={[
            'pad-input',
            isHeading ? 'pad-input-heading' : '',
            block.type === 'event' ? 'font-semibold' : '',
            block.done ? 'is-done' : '',
          ].join(' ')}
        />

        {/* Dated lines get a small chip. Clicking it opens the Notion-style
            popover — no permanent date widgets cluttering the page. */}
        {typed && (
          <div className="row-meta">
            <button
              className={block.date ? 'when-chip has-date' : 'when-chip'}
              onClick={() => setShowWhen((v) => !v)}
            >
              {whenLabel()}
            </button>
            {!noteOpen && (
              <button
                className="when-chip"
                onClick={() => {
                  setNoteOpen(true)
                  // focus after the textarea exists
                  requestAnimationFrame(() => noteRef.current?.focus())
                }}
              >
                + note
              </button>
            )}
          </div>
        )}

        {/* THE NOTE.
            Same font as the line above it, smaller and dimmer, so it reads as
            detail hanging off the task rather than a new item. Blurring an
            empty note closes it again, so you never leave a stray blank row. */}
        {typed && noteOpen && (
          <textarea
            ref={noteRef}
            rows={1}
            className="note-input"
            placeholder="Note"
            value={block.note ?? ''}
            onChange={(e) => onChange({ note: e.target.value })}
            onBlur={() => {
              if (!(block.note ?? '').trim()) {
                setNoteOpen(false)
                onChange({ note: undefined })
              }
            }}
            onKeyDown={(e) => {
              // Escape backs out; Enter is a newline here, not a new block,
              // because a note is prose rather than a list.
              if (e.key === 'Escape') {
                e.preventDefault()
                ref.current?.focus()
              }
            }}
          />
        )}

        {showWhen && typed && (
          <WhenPopover
            block={block}
            type={block.type}
            onChange={onChange}
            onClose={() => setShowWhen(false)}
          />
        )}
      </div>
    </div>
  )
}
