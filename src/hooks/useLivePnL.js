import { createContext, createElement, useContext, useEffect, useState } from 'react'
import { getPositionState } from '../utils/marketLogic'
import { exitPosition, subscribePositionExit } from '../utils/positionExit'

const MIN_TICK_MS = 12_000
const MAX_TICK_MS = 20_000
const PHASE_CHECK_MS = 30_000

function nextTickDelay() {
  return MIN_TICK_MS + Math.random() * (MAX_TICK_MS - MIN_TICK_MS)
}

const LivePnLContext = createContext(null)

function useLivePnLState() {
  const [state, setState] = useState(() => getPositionState())

  useEffect(() => {
    let timeoutId
    let cancelled = false

    const sync = (liveSeed = Date.now()) => {
      const next = getPositionState(undefined, liveSeed)
      setState(next)
      return next
    }

    const scheduleTick = () => {
      if (cancelled) return
      clearTimeout(timeoutId)
      const next = sync()
      if (next.isLive) {
        timeoutId = setTimeout(scheduleTick, nextTickDelay())
      }
    }

    const restart = () => {
      clearTimeout(timeoutId)
      const next = sync()
      if (next.isLive) {
        timeoutId = setTimeout(scheduleTick, nextTickDelay())
      }
    }

    restart()

    const unsubExit = subscribePositionExit(restart)
    const phaseCheck = setInterval(restart, PHASE_CHECK_MS)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      clearInterval(phaseCheck)
      unsubExit()
    }
  }, [])

  const exit = () => {
    const current = getPositionState()
    return exitPosition(current.pnl)
  }

  return { ...state, exitPosition: exit }
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
