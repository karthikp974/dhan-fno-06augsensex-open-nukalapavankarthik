const STORAGE_KEY = 'dhan_position_exit'

export function getISTNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
}

function formatPnL(value) {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `-${formatted}` : formatted
}

export function getManualExit() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isManuallyExited() {
  return getManualExit() !== null
}

function formatISTDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

function formatISTTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
}

export function exitPosition(pnl) {
  const now = getISTNow()
  const sellPrice = Math.max(0, 196 + pnl / 1460)

  const data = {
    pnl,
    formattedPnL: formatPnL(pnl),
    date: formatISTDate(now),
    time: formatISTTime(now),
    sortKey: now.getTime(),
    sellPrice: Math.round(sellPrice * 100) / 100,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('dhan-position-exit'))
  return data
}

export function clearManualExit() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('dhan-position-exit'))
}

export function subscribePositionExit(callback) {
  const handler = () => callback()
  window.addEventListener('dhan-position-exit', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('dhan-position-exit', handler)
    window.removeEventListener('storage', handler)
  }
}
