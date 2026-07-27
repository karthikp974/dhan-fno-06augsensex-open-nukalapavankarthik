import { getManualExit } from './positionExit'

const TUESDAY_START = new Date('2026-07-28T09:15:00+05:30')
const AUTO_SELL = new Date('2026-08-06T09:15:00+05:30')
const CLOSED_PNL = -1102840

export const RANGES = {
  profit: { min: 790000, max: 810000 },
  loss: { min: -1150000, max: -1050000 },
}

export function getISTNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
}

export function isWeekday(date) {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

export function isMarketHours(date) {
  if (!isWeekday(date)) return false
  const minutes = date.getHours() * 60 + date.getMinutes()
  return minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 15
}

export function getPositionPhase(now = getISTNow()) {
  if (getManualExit()) return 'closed'
  if (now >= AUTO_SELL) return 'closed'
  if (now >= TUESDAY_START) return 'loss'
  return 'profit'
}

function oscillate(min, max, tick) {
  const mid = (min + max) / 2
  const amp = (max - min) / 2
  const wave = mid + amp * Math.sin(tick * 0.12)
  const noise = (Math.random() - 0.5) * amp * 0.2
  return Math.round(wave + noise)
}

export function getPnLValue(now = getISTNow()) {
  const manualExit = getManualExit()
  if (manualExit) return manualExit.pnl

  const phase = getPositionPhase(now)

  if (phase === 'closed') {
    return CLOSED_PNL
  }

  const { min, max } = RANGES[phase]

  if (isMarketHours(now)) {
    return oscillate(min, max, Date.now() / 400)
  }

  return Math.round((min + max) / 2)
}

export function formatPnL(value) {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `-${formatted}` : formatted
}

export function getPositionState(now = getISTNow()) {
  const manualExit = getManualExit()
  const phase = getPositionPhase(now)
  const pnl = getPnLValue(now)
  const isRunning = !manualExit && phase !== 'closed'
  const isLive = isRunning && isMarketHours(now)

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
  }
}
