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

/** Back steps out one level rather than jumping home. */
export function stepBack(s: Screen): Screen {
  switch (s) {
    case 'padFull':
      return 'pad'
    case 'calendarFull':
      return 'calendar'
    case 'calendar':
      return 'pad'
    case 'pad':
      return 'capture'
    case 'pomodoro':
    case 'settings':
      return 'pad'
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
export const TIMING = {
  ui: 700, // panels, buttons, layout
  ribbon: 1250, // deliberately slower than the UI
  micro: 200, // block transforms, checkbox draw
  tick: 180, // ticking a task
  splashFade: 1400, // the slow fade-in of the mark
  through: 1750, // the zoom-through, matching the portfolio's intro T
  flyOut: 900, // (retired — kept so older callers still compile)
  railIdle: 5000, // how long before the rail slides away
} as const

/** The one easing curve the app uses, so nothing feels out of place. */
export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
