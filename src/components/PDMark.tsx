/**
 * THE P/D MARK
 * ============
 * It isn't a striped stencil — it's a pane of frosted glass cut to the shape of
 * the letter, with the ribbon behind showing through blurred.
 *
 * HOW THE GLASS WORKS (the trick worth understanding):
 * `clip-path` cuts an element to any shape you like. `backdrop-filter` blurs
 * whatever is BEHIND an element rather than the element itself. Put both on the
 * same div and you get real frosted glass in the shape of a letter — no image,
 * no PNG, and it stays sharp at any size. A stroked copy of the same path sits
 * on top to draw the thin bright edge.
 *
 * THE OPACITY, MEASURED NOT GUESSED:
 * Sampled off the Figma, the mark takes a plain #ECECEC canvas to exactly
 * 212/255 — it DARKENS. An earlier version used brightness(1.14) + white 10%,
 * which pushed 236 past 255 and clamped, so the mark rendered as a blown-out
 * hole. Black at 0.10 over an unboosted blur gives 212.4. Verified in Chromium.
 */

// Drawn in a 300 x 460 space; scaled with a transform so clip-path's pixel
// coordinates stay in step with the element's own box.
const W = 300
const H = 460

/**
 * THE LETTERFORM — deeper bowl.
 * The mark runs from y=20 to y=440, so 420 units tall. The bowl now closes at
 * y=327, which is (327-20)/420 = 73% of the way down, matching the Figma.
 * That leaves a 27% stem tail. The previous path closed at 64%, which made the
 * bowl look shallow and the tail too long.
 */
const PD_PATH =
  'M40 20 L150 20 C245 20 272 88 272 173 C272 259 245 327 150 327 L92 327 L92 440 L40 440 Z'

type Props = {
  /** rendered height in px */
  size?: number
  className?: string
  style?: React.CSSProperties
  /** so the splash can hand over when the zoom genuinely finishes */
  onAnimationEnd?: React.AnimationEventHandler<HTMLDivElement>
}

export default function PDMark({ size = 320, className, style, onAnimationEnd }: Props) {
  const scale = size / H

  return (
    <div
      className={className}
      style={{ width: W * scale, height: size, position: 'relative', ...style }}
      onAnimationEnd={onAnimationEnd}
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
            backdropFilter: 'blur(13px) saturate(0.92)',
            WebkitBackdropFilter: 'blur(13px) saturate(0.92)',
            background: 'rgb(0 0 0 / 0.22)',
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
            stroke="rgb(255 255 255 / 0.72)"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(6px 8px 14px rgb(0 0 0 / 0.16))' }}
          />
        </svg>
      </div>
    </div>
  )
}
