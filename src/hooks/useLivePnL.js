import { useEffect, useState } from 'react'
import { getPositionState } from '../utils/marketLogic'
import { exitPosition, subscribePositionExit } from '../utils/positionExit'

export default function useLivePnL() {
  const [state, setState] = useState(() => getPositionState())

  useEffect(() => {
    const update = () => {
      const next = getPositionState()
      setState((prev) => {
        if (!next.isLive && prev.pnl === next.pnl && prev.isLive === next.isLive) {
          return prev
        }
        return next
      })
    }

    update()

    const interval = setInterval(() => {
      const next = getPositionState()
      if (next.isLive) {
        setState(next)
      }
    }, 400)

    const unsubscribe = subscribePositionExit(update)
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const exit = () => {
    const current = getPositionState()
    return exitPosition(current.pnl)
  }

  return { ...state, exitPosition: exit }
}
