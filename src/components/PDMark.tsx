/**
 * The P/D mark.
 *
 * It isn't a striped stencil — it's a pane of frosted glass cut to the shape of
 * the letter, with the ribbon behind showing through blurred and lifted. So the
 * letterform is a `clip-path` on an element carrying `backdrop-filter`, rather
 * than a filled path. A stroked copy of the same path sits on top for the thin
 * bright edge.
 *
 * P and D are the same silhouette here: a stem with one very round bowl. The
 * bowl is solid, no counter, exactly as in the design.
 */

// Drawn in a 300 x 460 space; scaled with a transform so clip-path's pixel
// coordinates stay in step with the element's own box.
const W = 300
const H = 460
const PD_PATH =
  'M40 20 L150 20 C240 20 272 78 272 155 C272 232 240 290 150 290 L92 290 L92 440 L40 440 Z'

type Props = {
  /** rendered height in px */
  size?: number
  className?: string
}

export default function PDMark({ size = 320, className }: Props) {
  const scale = size / H

  return (
    <div
      className={className}
      style={{ width: W * scale, height: size, position: 'relative' }}
      aria-hidden="true"
    >
      <div
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* the glass itself */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `path('${PD_PATH}')`,
            WebkitClipPath: `path('${PD_PATH}')`,
            backdropFilter: 'blur(13px) brightness(1.14) saturate(0.92)',
            WebkitBackdropFilter: 'blur(13px) brightness(1.14) saturate(0.92)',
            background: 'rgb(255 255 255 / 0.1)',
          }}
        />
        {/* bright edge + the soft cast to its right */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          <path
            d={PD_PATH}
            fill="none"
            stroke="rgb(255 255 255 / 0.5)"
            strokeWidth="1.6"
            style={{ filter: 'drop-shadow(6px 8px 14px rgb(0 0 0 / 0.16))' }}
          />
        </svg>
      </div>
    </div>
  )
}
