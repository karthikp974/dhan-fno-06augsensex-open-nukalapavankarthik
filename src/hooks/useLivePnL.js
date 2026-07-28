import { createContext, createElement, useContext, useEffect, useRef, useState } from 'react'
import { formatPnL, getPositionState, getScheduledPnL } from '../utils/marketLogic'
import { getPnlOverride, setPnlOverride, subscribePnlOverride } from '../utils/pnlOverride'
import { exitPosition, subscribePositionExit } from '../utils/positionExit'

const MAX_LOSS = -286160
const JITTER = 5000
const MIN_TICK_MS = 2_500
const MAX_TICK_MS = 4_000
const PHASE_CHECK_MS = 30_000

function nextTickDelay() {
  return MIN_TICK_MS + Math.random() * (MAX_TICK_MS - MIN_TICK_MS)
}

function clampPnL(pnl) {
  return Math.max(pnl, MAX_LOSS)
}

function jitterPnL(current) {
  const delta = Math.round((Math.random() * 2 - 1) * JITTER)
  return clampPnL(current + delta)
}

function composeState(base, pnl, override) {
  const shuffling = base.marketLive && override.shuffleEnabled
  return {
    ...base,
    pnl,
    isLive: shuffling,
    isProfit: pnl >= 0,
    formattedPnL: formatPnL(pnl),
    shuffleEnabled: override.shuffleEnabled,
    hasCustomValue: override.customValue !== null,
  }
}

const LivePnLContext = createContext(null)

function useLivePnLState() {
  const displayRef = useRef(null)
  const phaseRef = useRef(getPositionState().phase)

  const [state, setState] = useState(() => {
    const override = getPnlOverride()
    const base = getPositionState()
    const anchor =
      override.customValue !== null ? override.customValue : getScheduledPnL()
    displayRef.current = anchor
    return composeState(base, anchor, override)
  })

  function sync({ shuffleStep = false, resetDisplay = false } = {}) {
    const base = getPositionState()
    const override = getPnlOverride()
    const scheduled = getScheduledPnL()

    if (resetDisplay || phaseRef.current !== base.phase) {
      phaseRef.current = base.phase
      displayRef.current = null
    }

    const anchor =
      override.customValue !== null ? override.customValue : scheduled

    if (displayRef.current === null) {
      displayRef.current = anchor
    }

    const shuffling = base.marketLive && override.shuffleEnabled

    if (shuffling && shuffleStep) {
      displayRef.current = jitterPnL(displayRef.current)
    } else if (!shuffling) {
      displayRef.current = anchor
    }

    const next = composeState(base, displayRef.current, override)
    setState(next)
    return next
  }

  useEffect(() => {
    let timeoutId
    let cancelled = false

    const scheduleTick = () => {
      if (cancelled) return
      clearTimeout(timeoutId)
      const next = sync({ shuffleStep: true })
      if (next.isLive) {
        timeoutId = setTimeout(scheduleTick, nextTickDelay())
      }
    }

    const restart = (resetDisplay = false) => {
      clearTimeout(timeoutId)
      const next = sync({ resetDisplay })
      if (next.isLive) {
        timeoutId = setTimeout(scheduleTick, nextTickDelay())
      }
    }

    restart()

    const unsubExit = subscribePositionExit(() => restart(true))
    const unsubOverride = subscribePnlOverride(() => restart(true))
    const phaseCheck = setInterval(() => restart(), PHASE_CHECK_MS)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      clearInterval(phaseCheck)
      unsubExit()
      unsubOverride()
    }
  }, [])

  const exit = () => exitPosition(sync().pnl)

  const applyOverride = (partial) => {
    setPnlOverride(partial)
  }

  return { ...state, exitPosition: exit, applyOverride }
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
