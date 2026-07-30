import { getCurrentTime } from './timeOverride'

const TUESDAY_START_MS = Date.parse('2026-07-28T09:20:00+05:30')
const AUTO_SELL_MS = Date.parse('2026-08-06T09:15:00+05:30')
const MAX_LOSS = -286160

const TUESDAY_DATE = '2026-07-28'
const WEDNESDAY_DATE = '2026-07-29'
const THURSDAY_START_DATE = '2026-07-30'
const LAST_DECLINE_DATE = '2026-08-05'

const TUESDAY_SHUFFLE_START = 9 * 60
const TUESDAY_MARKET_CLOSE = 15 * 60 + 15
const SESSION_START = 9 * 60 + 20
const MARKET_CLOSE = 15 * 60 + 15

/** Per-date session overrides (IST minutes from midnight). */
const SESSION_OVERRIDES = {
  '2026-07-30': { start: 11 * 60 + 30, close: 15 * 60 + 30 },
}

const PROFIT_SHUFFLE_END = 15 * 60 + 29
const PROFIT_FIXED_PNL = 837000
const TUESDAY_OPEN_PNL = 780000
const TUESDAY_CLOSE_PNL = 720000
const THURSDAY_OPEN_PNL = 127839

/** Market holidays — fixed P&L, no live shuffle. */
const MARKET_HOLIDAYS = new Set(['2026-07-29'])

export const RANGES = {
  profit: { min: 800000, max: 810000 },
}

function clampPnL(pnl) {
  return Math.max(pnl, MAX_LOSS)
}

export function getISTClock(date = getCurrentTime()) {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  })

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((p) => [p.type, p.value]),
  )

  const hour = Number(parts.hour)
  const minute = Number(parts.minute)

  return {
    hour,
    minute,
    weekday: parts.weekday,
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    totalMinutes: hour * 60 + minute,
    label: `${parts.hour}:${String(minute).padStart(2, '0')} IST`,
  }
}

export function isWeekdayIST(date = getCurrentTime()) {
  const { weekday } = getISTClock(date)
  return !['Sat', 'Sun'].includes(weekday)
}

export function isMarketHoliday(date = getCurrentTime()) {
  const { dateKey } = getISTClock(date)
  return MARKET_HOLIDAYS.has(dateKey)
}

function isDeclineDay(dateKey) {
  return dateKey >= THURSDAY_START_DATE && dateKey <= LAST_DECLINE_DATE
}

function getSessionWindow(date = getCurrentTime()) {
  const { dateKey } = getISTClock(date)
  const override = SESSION_OVERRIDES[dateKey]
  return {
    start: override?.start ?? SESSION_START,
    close: override?.close ?? MARKET_CLOSE,
  }
}

function getTuesdayShuffleAnchor(date) {
  const { totalMinutes } = getISTClock(date)
  const progress =
    (totalMinutes - TUESDAY_SHUFFLE_START) /
    (TUESDAY_MARKET_CLOSE - TUESDAY_SHUFFLE_START)
  return Math.round(TUESDAY_OPEN_PNL + (TUESDAY_CLOSE_PNL - TUESDAY_OPEN_PNL) * progress)
}

function getDeclineLinearPnL(date) {
  const { totalMinutes } = getISTClock(date)
  const { start, close } = getSessionWindow(date)

  if (totalMinutes < start) {
    return THURSDAY_OPEN_PNL
  }

  if (totalMinutes <= close) {
    const progress = (totalMinutes - start) / (close - start)
    return Math.round(THURSDAY_OPEN_PNL + (MAX_LOSS - THURSDAY_OPEN_PNL) * progress)
  }

  return MAX_LOSS
}

export function isTuesdayShuffleSession(date = getCurrentTime()) {
  const { dateKey, totalMinutes } = getISTClock(date)
  return (
    dateKey === TUESDAY_DATE &&
    totalMinutes >= TUESDAY_SHUFFLE_START &&
    totalMinutes <= TUESDAY_MARKET_CLOSE
  )
}

export function isDeclineSession(date = getCurrentTime()) {
  const { dateKey, totalMinutes } = getISTClock(date)
  const { start, close } = getSessionWindow(date)
  return (
    isDeclineDay(dateKey) &&
    isWeekdayIST(date) &&
    totalMinutes >= start &&
    totalMinutes <= close
  )
}

export function getPositionPhase(date = getCurrentTime()) {
  const nowMs = date.getTime()
  if (nowMs >= AUTO_SELL_MS) return 'closed'

  const { dateKey, totalMinutes } = getISTClock(date)

  if (isMarketHoliday(date)) return 'holiday'

  if (dateKey === TUESDAY_DATE) {
    if (totalMinutes >= TUESDAY_SHUFFLE_START && totalMinutes <= TUESDAY_MARKET_CLOSE) {
      return 'tuesday_shuffle'
    }
    if (totalMinutes > TUESDAY_MARKET_CLOSE) return 'frozen'
    return 'profit'
  }

  if (dateKey === WEDNESDAY_DATE) return 'holiday'

  if (isDeclineDay(dateKey) && isWeekdayIST(date)) {
    const { start, close } = getSessionWindow(date)
    if (totalMinutes >= start && totalMinutes <= close) {
      return 'decline'
    }
    return 'decline_frozen'
  }

  if (nowMs < TUESDAY_START_MS) return 'profit'

  return 'frozen'
}

export function isProfitShuffling(date = getCurrentTime()) {
  if (!isWeekdayIST(date)) return false
  if (getPositionPhase(date) !== 'profit') return false
  const { totalMinutes } = getISTClock(date)
  return totalMinutes <= PROFIT_SHUFFLE_END
}

export function isLossAnimating(date = getCurrentTime()) {
  return isDeclineSession(date)
}

export function isLiveSession(date = getCurrentTime()) {
  if (getPositionPhase(date) === 'closed') return false
  if (isMarketHoliday(date)) return false
  return isProfitShuffling(date) || isTuesdayShuffleSession(date) || isDeclineSession(date)
}

export function getScheduledPnL(date = getCurrentTime()) {
  const phase = getPositionPhase(date)
  if (phase === 'closed') return MAX_LOSS

  if (phase === 'tuesday_shuffle') return getTuesdayShuffleAnchor(date)

  if (phase === 'frozen' || phase === 'holiday') return TUESDAY_CLOSE_PNL

  if (phase === 'decline') return getDeclineLinearPnL(date)

  if (phase === 'decline_frozen') {
    const { dateKey, totalMinutes } = getISTClock(date)
    const { start, close } = getSessionWindow(date)
    if (dateKey === THURSDAY_START_DATE && totalMinutes < start) {
      return TUESDAY_CLOSE_PNL
    }
    if (totalMinutes > close) return getDeclineLinearPnL(date)
    return THURSDAY_OPEN_PNL
  }

  if (phase === 'profit') {
    const { totalMinutes } = getISTClock(date)
    if (totalMinutes > PROFIT_SHUFFLE_END) return PROFIT_FIXED_PNL
    if (isProfitShuffling(date)) return 805000
    return PROFIT_FIXED_PNL
  }

  return TUESDAY_CLOSE_PNL
}

export function getPnLValue(date = getCurrentTime()) {
  return getScheduledPnL(date)
}

const JITTER = 5000
const TICK_MS = 3000

/** Same P&L on every device — no shuffle on holidays or frozen days. */
export function getDisplayPnL(date = getCurrentTime()) {
  const scheduled = getScheduledPnL(date)
  if (isMarketHoliday(date) || !isLiveSession(date)) return scheduled

  const tick = Math.floor(date.getTime() / TICK_MS)
  const wave = Math.sin(tick * 0.73) * JITTER * 0.55
  const wave2 = Math.cos(tick * 0.41) * JITTER * 0.45
  return clampPnL(Math.round(scheduled + wave + wave2))
}

export function formatPnL(value) {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `-${formatted}` : formatted
}

export function getPositionState(date = getCurrentTime()) {
  const phase = getPositionPhase(date)
  const pnl = getScheduledPnL(date)
  const isRunning = phase !== 'closed'
  const marketLive = isRunning && isLiveSession(date)
  const ist = getISTClock(date)

  return {
    pnl,
    phase,
    isRunning,
    isLive: marketLive,
    marketLive,
    isProfit: pnl >= 0,
    formattedPnL: formatPnL(pnl),
    sectionTitle: isRunning ? 'Open Positions' : 'Closed Positions',
    statusLabel: isRunning ? 'Running' : 'Closed',
    exitInfo: null,
    istTime: ist.label,
  }
}
