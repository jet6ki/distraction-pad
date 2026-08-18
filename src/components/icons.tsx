/**
 * Hand-rolled icons matching the prototype's set. A handful of line icons isn't
 * worth an icon library — that would be tens of KB for a few paths.
 */

type IconProps = { className?: string }

const base = {
  width: 19,
  height: 19,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function Timer({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 1.5M9 2h6M18.5 5.5l1.5-1.5" />
    </svg>
  )
}

export function Back({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

export function Settings({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 2.6 15H2.5a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 7a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 2.6V2.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 2.9 1.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 21.4 9h.1a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.2 2.9z" />
    </svg>
  )
}

export function CalendarView({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M12 14v4M10 16h4" />
    </svg>
  )
}

export function Expand({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3" />
    </svg>
  )
}

export function Close({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  )
}
