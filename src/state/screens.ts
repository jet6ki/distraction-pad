/**
 * THE SCREEN MACHINE
 * ==================
 * Every screen the app can be on is listed here, once. Nothing else in the
 * codebase invents a screen name — they all import from this file.
 *
 * WHY THIS MATTERS FOR ADDING FEATURES LATER:
 * When you want a new screen (say a "Search" or "Archive" view), you add one
 * entry to `SCREENS` below and one entry to `RIBBON_POSES`. TypeScript will
 * then walk you round the codebase and point at every place that needs to
 * handle it. You cannot forget a spot, because the build fails until you do.
 * That is the whole reason this is a union of strings and not loose text.
 */

export const SCREENS = [
  'splash', // the P/D mark, fading in
  'capture', // the "what's on your mind?" pill
  'pad', // the notepad, normal size
  'padFull', // the notepad, filling the screen
  'calendar', // month grid, normal size
  'calendarFull', // month grid, filling the screen
  'pomodoro', // the timer dial
  'settings', // settings panel
] as const

export type Screen = (typeof SCREENS)[number]

/** Screens that render as the big centred glass panel. */
export const isPanelScreen = (s: Screen) => s !== 'splash' && s !== 'capture'

/** Screens that fill the whole viewport. */
export const isFullscreen = (s: Screen) => s === 'padFull' || s === 'calendarFull'

/** Screens where the rail sits on the right edge and never hides. */
export const railIsVertical = (s: Screen) => isFullscreen(s)

/** Pomodoro and Settings deliberately have no fullscreen form. */
export const canFullscreen = (s: Screen) => s === 'pad' || s === 'padFull' || s === 'calendar' || s === 'calendarFull'

/** The expand button toggles between these pairs. */
export function toggleFullscreen(s: Screen): Screen {
  switch (s) {
    case 'pad':
      return 'padFull'
    case 'padFull':
      return 'pad'
    case 'calendar':
      return 'calendarFull'
    case 'calendarFull':
      return 'calendar'
    default:
      return s
  }
}

/** The calendar button flips pad ↔ calendar, preserving the size you were at. */
export function toggleCalendar(s: Screen): Screen {
  switch (s) {
    case 'pad':
      return 'calendar'
    case 'calendar':
      return 'pad'
    case 'padFull':
      return 'calendarFull'
    case 'calendarFull':
      return 'padFull'
    default:
      return s
  }
}

/**
 * Pomodoro and Settings are OVERLAYS, not destinations. You get to them from
 * wherever you were, and Back should put you back exactly there — including
 * whether you were fullscreen.
 */
export const isOverlay = (s: Screen) => s === 'pomodoro' || s === 'settings'

/**
 * THE BACK STACK
 * ==============
 *   splash → capture → pad / calendar (either size) → pomodoro / settings
 *
 * Back walks that ladder down one rung:
 *   overlay          → whatever you were on before it
 *   pad or calendar  → capture      (either size; the corner button owns size)
 *   capture          → splash       (i.e. sign out, for now)
 *
 * `from` is the remembered origin for overlays. It's passed in rather than
 * stored here so this file stays a pure description of the machine — easy to
 * read, easy to test, no hidden state.
 */
export function stepBack(s: Screen, from: Screen = 'pad'): Screen {
  if (isOverlay(s)) return from
  switch (s) {
    case 'pad':
    case 'padFull':
    case 'calendar':
    case 'calendarFull':
      return 'capture'
    case 'capture':
      return 'splash'
    default:
      return s
  }
}

/**
 * RIBBON POSES
 * The ribbon is not wallpaper — it is the one element tying the screens
 * together. Each screen gives it a different position, rotation and scale, and
 * it eases between them more slowly than the UI so the background feels like
 * it is settling after the content has already moved.
 *
 * To retune a pose, edit the numbers here. Nothing else needs touching.
 */
export type Pose = { x: number; y: number; rotate: number; scale: number; blur: number }

export const RIBBON_POSES: Record<Screen, Pose> = {
  splash: { x: 0, y: 0, rotate: 0, scale: 1, blur: 0 },
  capture: { x: -4, y: 6, rotate: -5, scale: 1.05, blur: 1 },
  pad: { x: -10, y: 10, rotate: -8, scale: 1.15, blur: 2 },
  padFull: { x: -16, y: 14, rotate: -11, scale: 1.28, blur: 3 },
  calendar: { x: 8, y: 8, rotate: 6, scale: 1.15, blur: 2 },
  calendarFull: { x: 14, y: 12, rotate: 9, scale: 1.28, blur: 3 },
  pomodoro: { x: 6, y: -6, rotate: 4, scale: 1.1, blur: 2 },
  settings: { x: -6, y: -8, rotate: -4, scale: 1.1, blur: 2 },
}

/** Motion timings, in one place so the whole app feels consistent. */
/**
 * MOTION TIMINGS — retuned for speed.
 *
 * The old values (ui 700ms, ribbon 1250ms) were chosen to feel "considered"
 * and instead felt slow: every navigation cost the better part of a second
 * before you could act. Interface motion should confirm what happened, not
 * perform it. Roughly: 150ms reads as instant, 300ms as responsive, and
 * anything past ~500ms starts to feel like waiting.
 *
 * The ribbon is still slower than the UI — that lag is what makes the
 * background feel like it's settling behind the content — but the gap is now
 * 340ms rather than 550ms.
 */
export const TIMING = {
  ui: 340, // panels, buttons, layout
  ribbon: 680, // still slower than the UI, but no longer a drag
  micro: 150, // block transforms, checkbox draw
  tick: 140, // ticking a task
  splashFade: 750, // the mark arriving
  through: 1050, // the zoom-through
  flyOut: 900, // (retired — kept so older callers still compile)
  railIdle: 5000, // how long before the rail slides away
} as const

/** The one easing curve the app uses, so nothing feels out of place. */
export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
