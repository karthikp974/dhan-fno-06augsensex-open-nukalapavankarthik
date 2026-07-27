import { useEffect, useState } from 'react'
import { getPositionState } from '../utils/marketLogic'

export default function useLivePnL() {
  const [state, setState] = useState(() => getPositionState())

  useEffect(() => {
    const update = () => setState(getPositionState())
    update()
    const interval = setInterval(update, 600)
    return () => clearInterval(interval)
  }, [])

  return state
}
