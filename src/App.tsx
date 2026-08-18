import { useEffect, useMemo, useState } from 'react'
import Ribbon, { type RibbonPose } from './components/Ribbon'
import PDMark from './components/PDMark'
import Pad from './components/Pad'
import IconRail from './components/IconRail'
import { loadPads, savePads } from './lib/storage'
import { dayKey, newPad, unfinishedBefore, uid, type Pad as PadModel } from './lib/model'

type Screen = 'splash' | 'pad'

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [leaving, setLeaving] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const today = dayKey()
  const [pads, setPads] = useState<PadModel[]>(() => {
    const stored = loadPads()
    return stored.some((p) => p.day === today && p.name === null)
      ? stored
      : [...stored, newPad(today)]
  })

  // autosave: the pad is the document, so every keystroke is already committed
  useEffect(() => {
    savePads(pads)
  }, [pads])

  const todayPad = pads.find((p) => p.day === today && p.name === null)!
  const unfinished = useMemo(() => unfinishedBefore(pads, today), [pads, today])

  const pose: RibbonPose = screen === 'splash' ? 'splash' : expanded ? 'wide' : 'pad'

  /** The mark shrinks away as the pad rises through it, on one shared curve. */
  function enter() {
    setLeaving(true)
    setTimeout(() => setScreen('pad'), 260)
  }

  function back() {
    if (expanded) setExpanded(false)
    else {
      setScreen('splash')
      setLeaving(false)
    }
  }

  function updatePad(next: PadModel) {
    setPads((all) => all.map((p) => (p.id === next.id ? next : p)))
  }

  /** Copies unticked tasks from earlier days onto today, leaving originals be. */
  function pullForward() {
    const pulled = unfinished.map((b) => ({ ...b, id: uid(), done: false }))
    updatePad({
      ...todayPad,
      blocks: [...todayPad.blocks.filter((b) => b.text.trim() || b.type !== 'text'), ...pulled],
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <main className="relative grid h-full place-items-center overflow-hidden">
      <Ribbon pose={pose} />

      {screen === 'splash' ? (
        <button
          onClick={enter}
          aria-label="Enter Distraction Pad"
          className="group absolute inset-0 z-30 grid place-items-center"
        >
          <div
            className={[
              'flex flex-col items-center gap-10 transition-all duration-[900ms] ease-pad',
              leaving ? 'scale-[0.42] opacity-0' : 'scale-100 opacity-100',
            ].join(' ')}
          >
            <PDMark
              size={340}
              className="transition-transform duration-700 ease-pad group-hover:scale-[1.03]"
            />
            <span className="text-[11px] uppercase tracking-[0.22em] text-ink/40 transition-colors duration-500 group-hover:text-ink/70">
              click to enter
            </span>
          </div>
        </button>
      ) : (
        <>
          <div className="animate-rise">
            <Pad
              pad={todayPad}
              expanded={expanded}
              unfinishedCount={unfinished.length}
              onChange={updatePad}
              onToggleExpand={() => setExpanded((e) => !e)}
              onSwitchView={() => {}}
              onPullForward={pullForward}
            />
          </div>

          <IconRail placement={expanded ? 'right' : 'bottom'} onBack={back} />
        </>
      )}
    </main>
  )
}
