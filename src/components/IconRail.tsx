import { Back, Settings, Timer } from './icons'

type Props = {
  /** bottom-centre when browsing, right edge once a note is expanded */
  placement: 'bottom' | 'right'
  onBack: () => void
}

export default function IconRail({ placement, onBack }: Props) {
  const vertical = placement === 'right'

  return (
    <nav
      aria-label="Pad controls"
      className={[
        'absolute z-20 flex items-center transition-all duration-700 ease-pad',
        vertical
          ? 'right-8 top-1/2 -translate-y-1/2 flex-col gap-5'
          : 'bottom-10 left-1/2 -translate-x-1/2 flex-row gap-6',
      ].join(' ')}
    >
      <button className="icon-btn" aria-label="Settings">
        <Settings />
      </button>
      <button className="icon-btn" aria-label="Pomodoro">
        <Timer />
      </button>
      <button className="icon-btn" aria-label="Back" onClick={onBack}>
        <Back />
      </button>
    </nav>
  )
}
