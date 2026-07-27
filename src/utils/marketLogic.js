import { getManualExit } from './positionExit'
import { getCurrentTime } from './timeOverride'

const TUESDAY_START_MS = Date.parse('2026-07-28T09:20:00+05:30')
const AUTO_SELL_MS = Date.parse('2026-08-06T09:15:00+05:30')
const MAX_LOSS = -286160

const PROFIT_SHUFFLE_END = 15 * 60 + 29
const PROFIT_FIXED_PNL = 837000
const LOSS_OPEN_DROP = 500000
const LOSS_OPEN_PNL = PROFIT_FIXED_PNL - LOSS_OPEN_DROP
const LOSS_SESSION_START = 9 * 60 + 20
const MARKET_CLOSE = 15 * 60 + 30

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

export function isMarketHours(date = getCurrentTime()) {
  if (!isWeekdayIST(date)) return false
  const { totalMinutes } = getISTClock(date)
  return totalMinutes >= LOSS_SESSION_START && totalMinutes <= MARKET_CLOSE
}

export function getPositionPhase(date = getCurrentTime()) {
  if (getManualExit()) return 'closed'

  const nowMs = date.getTime()
  if (nowMs >= AUTO_SELL_MS) return 'closed'
  if (nowMs >= TUESDAY_START_MS) return 'loss'
  return 'profit'
}

function oscillate(min, max, tick) {
  const mid = (min + max) / 2
  const amp = (max - min) / 2
  const wave = mid + amp * Math.sin(tick * 0.12)
  const noise = (Math.random() - 0.5) * amp * 0.2
  return clampPnL(Math.round(wave + noise))
}

function getLossLinearPnL(date) {
  const { totalMinutes } = getISTClock(date)

  if (totalMinutes < LOSS_SESSION_START) {
    return MAX_LOSS
  }

  if (totalMinutes <= MARKET_CLOSE) {
    const progress =
      (totalMinutes - LOSS_SESSION_START) / (MARKET_CLOSE - LOSS_SESSION_START)
    return Math.round(LOSS_OPEN_PNL + (MAX_LOSS - LOSS_OPEN_PNL) * progress)
  }

  return MAX_LOSS
}

function getLossLivePnL(date, liveSeed = Date.now()) {
  const base = getLossLinearPnL(date)
  const band = Math.max(25_000, Math.round(Math.abs(base - MAX_LOSS) * 0.08))
  const min = clampPnL(base - band)
  const max = clampPnL(base + band)
  return oscillate(min, max, liveSeed / 350)
}

export function isProfitShuffling(date = getCurrentTime()) {
  if (!isWeekdayIST(date)) return false
  if (getPositionPhase(date) !== 'profit') return false
  const { totalMinutes } = getISTClock(date)
  return totalMinutes <= PROFIT_SHUFFLE_END
}

export function isLossAnimating(date = getCurrentTime()) {
  if (!isWeekdayIST(date)) return false
  if (getPositionPhase(date) !== 'loss') return false
  const { totalMinutes } = getISTClock(date)
  return totalMinutes >= LOSS_SESSION_START && totalMinutes <= MARKET_CLOSE
}

export function getPnLValue(date = getCurrentTime(), liveSeed = Date.now()) {
  const manualExit = getManualExit()
  if (manualExit) return clampPnL(manualExit.pnl)

  const phase = getPositionPhase(date)
  if (phase === 'closed') return MAX_LOSS

  if (phase === 'profit') {
    const { totalMinutes } = getISTClock(date)
    if (totalMinutes > PROFIT_SHUFFLE_END) {
      return PROFIT_FIXED_PNL
    }
    if (isWeekdayIST(date) && isProfitShuffling(date)) {
      const { min, max } = RANGES.profit
      return oscillate(min, max, liveSeed / 350)
    }
    return PROFIT_FIXED_PNL
  }

  if (phase === 'loss') {
    if (isWeekdayIST(date)) {
      if (isLossAnimating(date)) {
        return getLossLivePnL(date, liveSeed)
      }
      return getLossLinearPnL(date)
    }
    return MAX_LOSS
  }

  return PROFIT_FIXED_PNL
}

export function formatPnL(value) {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `-${formatted}` : formatted
}

export function getPositionState(date = getCurrentTime(), liveSeed = Date.now()) {
  const manualExit = getManualExit()
  const phase = getPositionPhase(date)
  const pnl = getPnLValue(date, liveSeed)
  const isRunning = !manualExit && phase !== 'closed'
  const isLive = isRunning && (isProfitShuffling(date) || isLossAnimating(date))
  const ist = getISTClock(date)

  return {
    pnl,
    phase,
    isRunning,
    isLive,
    isProfit: pnl >= 0,
    formattedPnL: formatPnL(pnl),
    sectionTitle: isRunning ? 'Open Positions' : 'Closed Positions',
    statusLabel: isRunning ? 'Running' : 'Closed',
    exitInfo: manualExit,
    istTime: ist.label,
  }
}
