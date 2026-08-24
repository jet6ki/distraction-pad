/**
 * THE APP SHELL
 * =============
 * Three jobs: remember which screen we're on, hold the pads and save them,
 * and decide what goes inside the glass panel.
 *
 * TECHNOLOGIES, PLAINLY:
 *  - React        draws the interface and redraws it when the data changes
 *  - TypeScript   checks the shape of your data before the code ever runs
 *  - Vite         the dev server, and the tool that builds the final files
 *  - Tailwind     styling as small class names instead of a separate CSS file
 *  - localStorage the browser's own tiny database; see lib/storage.ts
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import Ribbon from './components/Ribbon'
import Splash from './components/Splash'
import CaptureBar from './components/CaptureBar'
import IconRail from './components/IconRail'
import PadPanel from './components/Pad'
import CalendarView from './components/CalendarView'
import Pomodoro, { type PomodoroState } from './components/Pomodoro'
import SettingsPanel from './components/SettingsPanel'
import { Sparkle } from './components/icons'
import { loadPads, savePads } from './lib/storage'
import { dayKey, newPad, type Pad } from './lib/model'
import {
  EASE,
  TIMING,
  isFullscreen,
  isOverlay,
  isPanelScreen,
  stepBack,
  toggleCalendar,
  toggleFullscreen,
  type Screen,
} from './state/screens'

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [pads, setPads] = useState<Pad[]>(() => loadPads())
  const [activeDay, setActiveDay] = useState<string>(dayKey())
  const [typing, setTyping] = useState(false)

  /**
   * THE MORPH.
   * When the capture pill becomes the notepad we don't swap one for the other —
   * the panel is born at the pill's size and grows to full size on the next
   * frame. Because width, height and border-radius all have a CSS transition,
   * the browser tweens between the two and it reads as the pill stretching
   * open. `morphing` is true for exactly one frame.
   */
  const [morphing, setMorphing] = useState(false)

  /**
   * Where Back should return to when you leave an overlay.
   * Pomodoro and Settings can be opened from the pad OR the calendar, at
   * either size, and Back must land you exactly where you were — so we
   * remember the screen you left rather than assuming 'pad'.
   */
  const [origin, setOrigin] = useState<Screen>('pad')

  const [pom, setPom] = useState<PomodoroState | null>(null)
  const cursor = useMemo(() => new Date(activeDay + 'T00:00:00'), [activeDay])

  useEffect(() => {
    savePads(pads)
  }, [pads])

  const pad = useMemo(() => {
    const found = pads.find((p) => p.day === activeDay)
    return found ?? newPad(activeDay)
  }, [pads, activeDay])

  function updatePad(next: Pad) {
    setPads((all) => {
      const i = all.findIndex((p) => p.id === next.id)
      const stamped = { ...next, updatedAt: new Date().toISOString() }
      if (i === -1) return [...all, stamped]
      const copy = all.slice()
      copy[i] = stamped
      return copy
    })
  }

  /**
   * The capture bar is a door, not a field: pressing it opens today's pad.
   * The panel is born at the bar's size and grows, so it reads as the bar
   * opening out rather than a new screen replacing it.
   */
  const openPad = useCallback(() => {
    setMorphing(true)
    setScreen('pad')
    requestAnimationFrame(() => requestAnimationFrame(() => setMorphing(false)))
  }, [])

  /**
   * STABLE CALLBACK — this one matters.
   * Splash listens for its own animation to end, but any prop that changes
   * identity every render can still cause avoidable re-mounts and effect
   * churn downstream. useCallback with an empty dep list gives the child the
   * SAME function object for the life of the app.
   */
  const enterFromSplash = useCallback(() => setScreen('capture'), [])

  /**
   * Open an overlay, remembering where we came from.
   * Pressing the same rail button again does nothing: the rail is a way IN,
   * the back button is the way out. Making the button toggle was the thing
   * that kept dumping you on the notepad from the calendar.
   */
  const openOverlay = useCallback((next: Screen) => {
    setScreen((cur) => {
      if (cur === next) return cur
      if (!isOverlay(cur)) setOrigin(cur)
      return next
    })
  }, [])

  const goBack = useCallback(() => {
    setScreen((cur) => stepBack(cur, origin))
  }, [origin])

  /**
   * Clearing the "typing" flag on mouse movement is what lets the rail come
   * back. Guarding on the current value matters: setState with an unchanged
   * value still schedules work, and this fires on every pixel of movement.
   * The functional form lets us bail out without adding `typing` as a dep.
   */
  useEffect(() => {
    const onMove = () => setTyping((t) => (t ? false : t))
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const full = isFullscreen(screen)
  const onPomState = useCallback((s: PomodoroState) => setPom(s), [])

  function panelBody() {
    switch (screen) {
      case 'pad':
      case 'padFull':
        return (
          <PadPanel
            pad={pad}
            fullscreen={full}
            onChange={updatePad}
            onTyping={() => setTyping(true)}
            onCalendar={() => setScreen(toggleCalendar(screen))}
            onToggleSize={() => setScreen(toggleFullscreen(screen))}
          />
        )
      case 'calendar':
      case 'calendarFull':
        return (
          <CalendarView
            pads={pads}
            cursor={cursor}
            dense={screen === 'calendar'}
            onPickDay={(d) => {
              setActiveDay(d)
              setScreen(full ? 'padFull' : 'pad')
            }}
            onCalendar={() => setScreen(toggleCalendar(screen))}
            onToggleSize={() => setScreen(toggleFullscreen(screen))}
          />
        )
      case 'settings':
        return <SettingsPanel />
      default:
        return null // pomodoro draws itself from the always-mounted host below
    }
  }

  const mm = pom ? String(Math.floor(pom.remaining / 60)).padStart(2, '0') : '00'
  const ss = pom ? String(pom.remaining % 60).padStart(2, '0') : '00'

  return (
    <div className="app-root">
      <Ribbon screen={screen} />

      {screen === 'splash' && <Splash onEnter={enterFromSplash} />}
      {screen === 'capture' && <CaptureBar onOpenPad={openPad} />}

      {isPanelScreen(screen) && (
        <div className={full ? 'panel-stage stage-full' : 'panel-stage'}>
          <div
            className={[
              'glass panel',
              full ? 'panel-full' : '',
              morphing ? 'panel-morph' : '',
            ].join(' ')}
            /* Explicit properties, never `all`. `transition: all` includes
               backdrop-filter, box-shadow and colour — the browser then
               re-rasterises the blur every frame of every layout change,
               which is most of why this felt sluggish. */
            style={{
              transition: `width ${TIMING.ui}ms ${EASE}, height ${TIMING.ui}ms ${EASE}, border-radius ${TIMING.ui}ms ${EASE}, padding ${TIMING.ui}ms ${EASE}`,
            }}
          >
            {/* The AI button survives the morph — it parks in the panel's top
                corner rather than disappearing with the pill. ⌘K also opens it
                once the assistant lands. */}
            {screen !== 'pomodoro' && screen !== 'settings' && (
              <button className="ai-dot" aria-label="Ask AI (⌘K)" title="Ask AI — coming in v1.0">
                <Sparkle />
              </button>
            )}
            {panelBody()}
          </div>
        </div>
      )}

      {/*
        POMODORO LIVES HERE, ALWAYS MOUNTED.
        If it were rendered only on its own screen, React would unmount it the
        moment you navigated away and the countdown would die. Keeping it
        mounted and merely hidden is what lets it keep running in the
        background — and lets the mini clock below stay truthful.
      */}
      <div className={screen === 'pomodoro' ? 'pom-host' : 'pom-host is-idle'}>
        <Pomodoro onStateChange={onPomState} />
      </div>

      {/* the minimised clock, only while running and only when you're elsewhere */}
      {pom?.running && screen !== 'pomodoro' && (
        <button className="pom-mini" onClick={() => setScreen('pomodoro')} title="Open timer">
          <span className="pom-mini-time">
            {mm}:{ss}
          </span>
          <span className="pom-mini-phase">{pom.phase}</span>
        </button>
      )}

      {screen !== 'splash' && (
        <IconRail
          screen={screen}
          suppressed={typing && !full}
          onBack={goBack}
          onPomodoro={() => openOverlay('pomodoro')}
          onSettings={() => openOverlay('settings')}
        />
      )}
    </div>
  )
}
