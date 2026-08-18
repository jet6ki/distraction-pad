const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1: return `${n}st`
    case 2: return `${n}nd`
    case 3: return `${n}rd`
    default: return `${n}th`
  }
}

/** "March 4th" — the format used on the note cards in the prototype. */
export function longDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${ordinal(d.getDate())}`
}

/** "Tuesday, August 18th" — the label under the pad. */
export function longDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  const weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()]
  return `${weekday}, ${longDate(date)}`
}
