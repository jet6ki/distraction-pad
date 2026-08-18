import { useEffect, useRef } from 'react'
import { detectPrefix, type Block } from '../lib/model'

type Props = {
  block: Block
  index: number
  focused: boolean
  onChange: (patch: Partial<Block>) => void
  onEnter: () => void
  onBackspaceEmpty: () => void
  onFocus: () => void
}

/**
 * One line of the pad. Heading if it's the first row, otherwise body.
 * Typing "- " or "/ " at the start converts the row in place and eats the
 * prefix, so the markup never stays on screen.
 */
export default function BlockRow({
  block,
  index,
  focused,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onFocus,
}: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const isHeading = index === 0

  useEffect(() => {
    if (focused) ref.current?.focus()
  }, [focused])

  function handleChange(value: string) {
    const hit = block.type === 'text' ? detectPrefix(value) : null
    if (hit) {
      onChange({ type: hit.type, text: hit.text, ...(hit.type === 'task' ? { done: false } : {}) })
      return
    }
    onChange({ text: value })
  }

  return (
    <div className="group flex items-start gap-3">
      {/* task checkbox */}
      {block.type === 'task' && (
        <button
          onClick={() => onChange({ done: !block.done })}
          aria-label={block.done ? 'Mark as not done' : 'Mark as done'}
          className={[
            'mt-[5px] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-[5px] border',
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

      {/* event marker */}
      {block.type === 'event' && (
        <span className="mt-[6px] h-[9px] w-[9px] shrink-0 rounded-full bg-ribbon-green" />
      )}

      <div className="min-w-0 flex-1">
        <input
          ref={ref}
          value={block.text}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onEnter()
            }
            if (e.key === 'Backspace' && block.text === '') {
              e.preventDefault()
              onBackspaceEmpty()
            }
          }}
          placeholder={isHeading ? "what's on your mind?" : ''}
          className={[
            'w-full bg-transparent focus:outline-none',
            'placeholder:text-white/55',
            isHeading
              ? 'text-[17px] font-semibold text-white/95'
              : 'text-[14.5px] leading-relaxed text-white/85',
            block.done ? 'text-white/45 line-through' : '',
          ].join(' ')}
        />

        {/* when — events always want one, tasks may have one */}
        {(block.type === 'event' || (block.type === 'task' && block.date)) && (
          <label className="mt-1 inline-flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/55 transition hover:text-white/85">
            <input
              type="datetime-local"
              value={block.date ? `${block.date}T${block.time ?? '09:00'}` : ''}
              onChange={(e) => {
                const [d, t] = e.target.value.split('T')
                onChange({ date: d || undefined, time: t || undefined })
              }}
              className="bg-transparent text-[11px] uppercase tracking-[0.12em] text-white/70 focus:outline-none"
            />
            {!block.date && <span>when?</span>}
          </label>
        )}
      </div>
    </div>
  )
}
