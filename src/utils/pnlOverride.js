const STORAGE_KEY = 'dhan_pnl_override'

const DEFAULT = {
  customValue: null,
  shuffleEnabled: true,
}

export function getPnlOverride() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw)
    return {
      customValue:
        typeof parsed.customValue === 'number' ? parsed.customValue : null,
      shuffleEnabled:
        typeof parsed.shuffleEnabled === 'boolean' ? parsed.shuffleEnabled : true,
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function setPnlOverride(partial) {
  const next = { ...getPnlOverride(), ...partial }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('dhan-pnl-override-change'))
  return next
}

export function subscribePnlOverride(callback) {
  const handler = () => callback()
  window.addEventListener('dhan-pnl-override-change', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('dhan-pnl-override-change', handler)
    window.removeEventListener('storage', handler)
  }
}
