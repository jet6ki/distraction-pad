/**
 * The ribbon artwork from the prototype, rebuilt as SVG.
 *
 * It reads as two woven bundles — one grey falling from the top-right, one
 * green rising from the left — but it's really one S-curve drawn several times
 * at small offsets. Stroking the same path repeatedly is what produces the
 * striped, folded-paper look, and it means the whole thing is a handful of
 * paths rather than an exported bitmap.
 *
 * preserveAspectRatio="xMidYMid slice" makes it cover any viewport the way a
 * background-size:cover image would.
 */

import { RIBBON_POSES, type Screen } from '../state/screens'

type Bundle = {
  d: string
  color: string
  /** perpendicular offsets, in viewBox units, for each stripe in the bundle */
  offsets: number[]
  width: number
  opacity?: number
}

const BUNDLES: Bundle[] = [
  // Every path starts and ends well outside the viewBox — a stripe that ends
  // on canvas shows a blunt cut end, which the prototype never does.
  // dark bundle: enters top-right, sweeps down and off the bottom-left
  {
    d: 'M 1240 -220 C 1240 260, 1000 320, 700 450 C 400 580, 260 700, 260 1180',
    color: '#4A4A4A',
    offsets: [-92, -46, 0, 46, 92],
    width: 24,
  },
  // green bundle: enters left, arcs over the crossing point, exits right
  {
    d: 'M -240 780 C 200 330, 520 270, 800 355 C 1080 440, 1200 515, 1720 445',
    color: '#0E8A62',
    offsets: [-84, -42, 0, 42, 84],
    width: 22,
  },
  // pale bundle behind both, for depth
  {
    d: 'M -300 1080 C 120 950, 360 780, 560 550 C 760 320, 960 180, 1720 120',
    color: '#9A9A9A',
    offsets: [-76, -38, 0, 38],
    width: 18,
    opacity: 0.7,
  },
]

/**
 * Each screen gets a pose. The ribbon transitions between them slightly slower
 * than the UI does, so the background reads as settling after the content has
 * already moved — that lag is most of what makes it feel composed rather than
 * like wallpaper sitting behind a page swap.
 *
 * Every screen now has its own pose, listed in state/screens.ts. To retune one,
 * edit the numbers there — nothing in this file needs touching.
 *
 * The slight blur is applied to the whole layer rather than per-path, so the
 * browser can composite it once on the GPU instead of per stroke.
 */
export default function Ribbon({ screen }: { screen: Screen }) {
  const pose = RIBBON_POSES[screen]
  const transform = `translate3d(${pose.x}%, ${pose.y}%, 0) scale(${pose.scale}) rotate(${pose.rotate}deg)`

  return (
    /**
     * PERFORMANCE — the biggest win in the whole app was here.
     *
     * This layer used to carry `filter: blur(Npx)` with the value CHANGING per
     * screen and a `transition` on it. A filter on a full-viewport element
     * forces the browser to rasterise the entire artwork and then blur it —
     * and animating the filter value makes it redo that work every single
     * frame, while the glass panels on top are each running their own
     * backdrop-filter over the result. That's what made navigation feel heavy.
     *
     * Now the blur is a single CONSTANT value that never animates, so it is
     * rasterised once and cached. Only `transform` changes between screens,
     * and transforms are handled by the compositor without repainting
     * anything. Same look, a fraction of the cost.
     */
    <div
      className="ribbon-layer pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          className="ribbon-pose"
          style={{ transform }}
        >
         <g className="ribbon-drift">
          {BUNDLES.map((bundle, bi) => (
            <g key={bi} opacity={bundle.opacity ?? 1}>
              {bundle.offsets.map((offset, si) => (
                <path
                  key={si}
                  d={bundle.d}
                  fill="none"
                  stroke={bundle.color}
                  strokeWidth={bundle.width}
                  strokeLinecap="butt"
                  transform={`translate(${offset * 0.35} ${offset})`}
                />
              ))}
            </g>
          ))}
         </g>
        </g>
      </svg>
    </div>
  )
}
