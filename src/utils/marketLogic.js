import { getCurrentTime } from './timeOverride'
import { isFundsWithdrawn } from './withdrawState'

const TUESDAY_START_MS = Date.parse('2026-07-28T09:20:00+05:30')
const AUTO_SELL_MS = Date.parse('2026-08-06T09:15:00+05:30')
const MAX_LOSS = -286160
const TRADE_EXIT_MS = Date.parse('2026-07-30T11:30:00+05:30')
export const ACCOUNT_FUNDS = 804832.73
export const SETTLED_ACCOUNT_FUNDS = 1194752.38
const EXIT_PNL = ACCOUNT_FUNDS

const SETTLED_DATE = '2026-08-13'
const WITHDRAW_OPEN_MS = Date.parse('2026-08-13T13:36:00+05:30')
export const WITHDRAW_CREDIT_MESSAGE =
  'Amount will be credited by 4:30 PM on 13/08/2026.'
export const WITHDRAW_PENDING_NOTE =
  'Amount will be available for withdrawal after 24 hours (1:36 PM).'

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
const DECLINE_START_MS = Date.parse('2026-07-30T12:00:00+05:30')
const DECLINE_OPEN_PNL = 108354

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

export function getISTGreeting(date = getCurrentTime()) {
  const { hour } = getISTClock(date)
  if (hour >= 5 && hour < 12) return 'GOOD MORNING'
  if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON'
  return 'GOOD EVENING'
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
  const nowMs = date.getTime()
  if (nowMs < DECLINE_START_MS) return TUESDAY_CLOSE_PNL
  if (nowMs >= AUTO_SELL_MS) return MAX_LOSS

  const progress = (nowMs - DECLINE_START_MS) / (AUTO_SELL_MS - DECLINE_START_MS)
  return clampPnL(Math.round(DECLINE_OPEN_PNL + (MAX_LOSS - DECLINE_OPEN_PNL) * progress))
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
  const nowMs = date.getTime()
  if (nowMs < DECLINE_START_MS || nowMs >= AUTO_SELL_MS) return false

  const { dateKey, totalMinutes } = getISTClock(date)
  if (!isDeclineDay(dateKey) || !isWeekdayIST(date)) return false

  const { start, close } = getSessionWindow(date)
  return totalMinutes >= start && totalMinutes <= close
}

export function isSettledDay(date = getCurrentTime()) {
  const { dateKey } = getISTClock(date)
  return dateKey >= SETTLED_DATE
}

export function getAccountFunds(date = getCurrentTime()) {
  if (isFundsWithdrawn()) return 0
  return isSettledDay(date) ? SETTLED_ACCOUNT_FUNDS : ACCOUNT_FUNDS
}

export function isWithdrawAvailable(date = getCurrentTime()) {
  if (!isSettledDay(date)) return false
  return date.getTime() >= WITHDRAW_OPEN_MS
}

export function getPositionPhase(date = getCurrentTime()) {
  const { dateKey } = getISTClock(date)

  if (isSettledDay(date)) return 'settled'

  const nowMs = date.getTime()
  if (nowMs >= TRADE_EXIT_MS) return 'closed'

  const { totalMinutes } = getISTClock(date)

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
    if (nowMs < DECLINE_START_MS) return 'frozen'
    if (isDeclineSession(date)) return 'decline'
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
  if (phase === 'settled') return 0
  if (phase === 'closed') return EXIT_PNL

  if (phase === 'tuesday_shuffle') return getTuesdayShuffleAnchor(date)

  if (phase === 'frozen' || phase === 'holiday') return TUESDAY_CLOSE_PNL

  if (phase === 'decline' || phase === 'decline_frozen') return getDeclineLinearPnL(date)

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

export function getExitInfo(date = getCurrentTime()) {
  if (getPositionPhase(date) !== 'closed') return null
  return {
    pnl: EXIT_PNL,
    formattedPnL: formatPnL(EXIT_PNL),
    date: '30 Jul 2026',
    time: '11:30 AM',
    sortKey: TRADE_EXIT_MS,
    sellPrice: Math.round((196 + EXIT_PNL / 1460) * 100) / 100,
  }
}

export function getPositionState(date = getCurrentTime()) {
  const phase = getPositionPhase(date)
  const pnl = getScheduledPnL(date)
  const hasOpenPosition = !['closed', 'settled'].includes(phase)
  const isRunning = hasOpenPosition
  const marketLive = isRunning && isLiveSession(date)
  const ist = getISTClock(date)
  const exitInfo = getExitInfo(date)

  return {
    pnl,
    phase,
    hasOpenPosition,
    isRunning,
    isLive: marketLive,
    marketLive,
    isProfit: pnl >= 0,
    formattedPnL: formatPnL(pnl),
    sectionTitle: phase === 'settled' ? 'Open Positions' : isRunning ? 'Open Positions' : 'Closed Positions',
    statusLabel: isRunning ? 'Running' : 'Closed',
    positionCount: hasOpenPosition ? 1 : 0,
    exitInfo,
    istTime: ist.label,
  }
}
