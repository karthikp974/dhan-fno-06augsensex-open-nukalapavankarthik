import { getManualExit } from './positionExit'

const TUESDAY_START_MS = Date.parse('2026-07-28T09:15:00+05:30')
const AUTO_SELL_MS = Date.parse('2026-08-06T09:15:00+05:30')
const CLOSED_PNL = -1102840
const MARKET_OPEN = 9 * 60 + 15
const MARKET_CLOSE = 15 * 60 + 15
const PROFIT_SHUFFLE_END = 15 * 60 + 29
const PROFIT_FIXED_PNL = 837000

export const RANGES = {
  profit: { min: 800000, max: 810000 },
  loss: { min: -1150000, max: -1050000 },
}

export function getISTClock(date = new Date()) {
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
    label: `${parts.hour}:${parts.minute} IST`,
  }
}

export function isWeekdayIST(date = new Date()) {
  const { weekday } = getISTClock(date)
  return !['Sat', 'Sun'].includes(weekday)
}

export function isMarketHours(date = new Date()) {
  if (!isWeekdayIST(date)) return false
  const { totalMinutes } = getISTClock(date)
  return totalMinutes >= MARKET_OPEN && totalMinutes <= MARKET_CLOSE
}

export function getPositionPhase(date = new Date()) {
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
  return Math.round(wave + noise)
}

function getStorageKey(dateKey) {
  return `dhan_frozen_pnl_${dateKey}`
}

function saveFrozenPnL(dateKey, pnl) {
  try {
    localStorage.setItem(getStorageKey(dateKey), String(pnl))
  } catch {
    // ignore storage errors
  }
}

function loadFrozenPnL(dateKey) {
  try {
    const saved = localStorage.getItem(getStorageKey(dateKey))
    return saved ? Number(saved) : null
  } catch {
    return null
  }
}

function getDeterministicFrozenPnl(phase, dateKey) {
  const { min, max } = RANGES[phase]
  let seed = 0
  for (let i = 0; i < dateKey.length; i += 1) seed += dateKey.charCodeAt(i)
  const mid = (min + max) / 2
  const amp = (max - min) / 2
  return Math.round(mid + amp * Math.sin(seed * 0.017) * 0.85)
}

export function isProfitShuffling(date = new Date()) {
  if (!isWeekdayIST(date)) return false
  if (getPositionPhase(date) !== 'profit') return false
  const { totalMinutes } = getISTClock(date)
  return totalMinutes <= PROFIT_SHUFFLE_END
}

export function getPnLValue(date = new Date()) {
  const manualExit = getManualExit()
  if (manualExit) return manualExit.pnl

  const phase = getPositionPhase(date)
  if (phase === 'closed') return CLOSED_PNL

  if (phase === 'profit') {
    const { totalMinutes } = getISTClock(date)
    if (totalMinutes > PROFIT_SHUFFLE_END) {
      return PROFIT_FIXED_PNL
    }
    if (isWeekdayIST(date)) {
      const { min, max } = RANGES.profit
      return oscillate(min, max, Date.now() / 400)
    }
  }

  if (phase === 'loss' && isWeekdayIST(date)) {
    const { min, max } = RANGES.loss
    return oscillate(min, max, Date.now() / 400)
  }

  const { dateKey } = getISTClock(date)
  return getDeterministicFrozenPnl(phase, dateKey)
}

export function formatPnL(value) {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `-${formatted}` : formatted
}

export function getPositionState(date = new Date()) {
  const manualExit = getManualExit()
  const phase = getPositionPhase(date)
  const pnl = getPnLValue(date)
  const isRunning = !manualExit && phase !== 'closed'
  const isLive =
    isRunning &&
    ((phase === 'profit' && isProfitShuffling(date)) ||
      (phase === 'loss' && isWeekdayIST(date)))
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
