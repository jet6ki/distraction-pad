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
 */
export type RibbonPose = 'splash' | 'pad' | 'wide'

const POSES: Record<RibbonPose, string> = {
  splash: 'translate3d(0,0,0) scale(1.02) rotate(0deg)',
  pad: 'translate3d(-4%,7%,0) scale(1.12) rotate(-3.5deg)',
  wide: 'translate3d(-9%,13%,0) scale(1.24) rotate(-6deg)',
}

export default function Ribbon({ pose = 'splash' }: { pose?: RibbonPose }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          className="ribbon-pose"
          style={{ transform: POSES[pose] }}
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
