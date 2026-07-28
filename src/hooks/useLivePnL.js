import { createContext, createElement, useContext, useEffect, useState } from 'react'
import {
  formatPnL,
  getDisplayPnL,
  getPositionState,
  getScheduledPnL,
} from '../utils/marketLogic'

const MAX_LOSS = -286160
const SYNC_MS = 1000
const PHASE_CHECK_MS = 30_000

const DEFAULT_OVERRIDE = { customValue: null, shuffleEnabled: true }

function composeState(base, pnl, shuffleEnabled) {
  const shuffling = base.marketLive && shuffleEnabled
  return {
    ...base,
    pnl,
    isLive: shuffling,
    isProfit: pnl >= 0,
    formattedPnL: formatPnL(pnl),
    shuffleEnabled,
  }
}

function computePnL(override) {
  const live = getDisplayPnL()

  if (override.customValue !== null && !override.shuffleEnabled) {
    return override.customValue
  }

  if (override.customValue !== null && override.shuffleEnabled) {
    const scheduled = getScheduledPnL()
    const delta = live - scheduled
    return Math.max(MAX_LOSS, Math.round(override.customValue + delta))
  }

  return live
}

const LivePnLContext = createContext(null)

function useLivePnLState() {
  const [override, setOverride] = useState(DEFAULT_OVERRIDE)

  const [state, setState] = useState(() => {
    const base = getPositionState()
    return composeState(base, computePnL(DEFAULT_OVERRIDE), true)
  })

  useEffect(() => {
    const sync = () => {
      const base = getPositionState()
      const pnl = computePnL(override)
      setState(composeState(base, pnl, override.shuffleEnabled))
    }

    sync()
    const tick = setInterval(sync, SYNC_MS)
    const phaseCheck = setInterval(sync, PHASE_CHECK_MS)
    return () => {
      clearInterval(tick)
      clearInterval(phaseCheck)
    }
  }, [override])

  const applyOverride = (partial) => {
    setOverride((prev) => ({ ...prev, ...partial }))
  }

  return { ...state, applyOverride }
}

export function LivePnLProvider({ children }) {
  const value = useLivePnLState()
  return createElement(LivePnLContext.Provider, { value }, children)
}

export default function useLivePnL() {
  const ctx = useContext(LivePnLContext)
  if (!ctx) {
    throw new Error('useLivePnL must be used within LivePnLProvider')
  }
  return ctx
}
