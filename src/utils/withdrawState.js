const STORAGE_KEY = 'dhan_withdraw_complete'

let remoteSynced = false

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getWithdrawRecord() {
  return readLocal()
}

export function isFundsWithdrawn() {
  return remoteSynced || readLocal() !== null
}

function notify() {
  window.dispatchEvent(new Event('dhan-withdraw-state'))
}

export async function syncWithdrawState() {
  try {
    const res = await fetch('/api/withdraw-status')
    if (!res.ok) return

    const data = await res.json()
    if (!data.withdrawn) return

    remoteSynced = true
    if (data.record && !readLocal()) {
      writeLocal(data.record)
    }
    notify()
  } catch {
    // API unavailable in local dev without vercel dev
  }
}

export async function markFundsWithdrawn(record) {
  const payload = {
    ...record,
    at: Date.now(),
  }

  writeLocal(payload)
  remoteSynced = true
  notify()

  try {
    await fetch('/api/withdraw-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // local state still applied on this device
  }
}

export function subscribeWithdrawState(callback) {
  const handler = () => callback()
  window.addEventListener('dhan-withdraw-state', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('dhan-withdraw-state', handler)
    window.removeEventListener('storage', handler)
  }
}
