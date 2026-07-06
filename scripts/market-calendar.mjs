/** NSE session calendar helpers (IST). */

export const IST = 'Asia/Kolkata'
export const MARKET_OPEN_MINUTES = 9 * 60 + 15   // 09:15
export const MARKET_CLOSE_MINUTES = 15 * 60 + 30 // 15:30

export function istDateKey(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST }).format(d)
}

export function istWeekday(d = new Date()) {
  return new Intl.DateTimeFormat('en-US', { timeZone: IST, weekday: 'short' }).format(d)
}

export function istMinutes(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find(p => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

export function istTimeLabel(d = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

export function isWeekdayIST(d = new Date()) {
  const day = istWeekday(d)
  return day !== 'Sat' && day !== 'Sun'
}

export function isWithinNSEHours(d = new Date()) {
  const mins = istMinutes(d)
  return mins >= MARKET_OPEN_MINUTES && mins <= MARKET_CLOSE_MINUTES
}

export function sessionSlot(d = new Date()) {
  const mins = istMinutes(d)
  if (mins < 11 * 60) return 'opening'
  if (mins < 14 * 60) return 'midday'
  return 'closing'
}

export function addCalendarDays(dateKey, days) {
  const d = new Date(`${dateKey}T12:00:00+05:30`)
  d.setDate(d.getDate() + days)
  return istDateKey(d)
}

export function nextTradingDay(fromKey = istDateKey()) {
  let key = fromKey
  for (let i = 0; i < 10; i++) {
    key = addCalendarDays(key, 1)
    const dow = new Date(`${key}T12:00:00+05:30`).getDay()
    if (dow !== 0 && dow !== 6) return key
  }
  return addCalendarDays(fromKey, 1)
}

/**
 * Returns null when the run should proceed, or a skip reason string.
 */
export function localCalendarGate(d = new Date()) {
  if (!isWeekdayIST(d)) {
    return 'weekend — NSE closed (Mon–Fri only)'
  }
  if (!isWithinNSEHours(d)) {
    return `outside NSE hours (${istTimeLabel(d)} IST) — updates only 09:15–15:30 IST`
  }
  return null
}
