import { useEffect, useState } from 'react'
import { getPositionState } from '../utils/marketLogic'
import { exitPosition, subscribePositionExit } from '../utils/positionExit'

export default function useLivePnL() {
  const [state, setState] = useState(() => getPositionState())

  useEffect(() => {
    const update = () => setState(getPositionState())
    update()
    const interval = setInterval(update, 600)
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
