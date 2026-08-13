import { useEffect, useState } from 'react'
import {
  getWithdrawRecord,
  isFundsWithdrawn,
  subscribeWithdrawState,
  syncWithdrawState,
} from '../utils/withdrawState'

const SYNC_MS = 5000

export default function useWithdrawState() {
  const [withdrawn, setWithdrawn] = useState(() => isFundsWithdrawn())
  const [record, setRecord] = useState(() => getWithdrawRecord())

  useEffect(() => {
    const refresh = () => {
      setWithdrawn(isFundsWithdrawn())
      setRecord(getWithdrawRecord())
    }

    const sync = async () => {
      await syncWithdrawState()
      refresh()
    }

    sync()
    const unsub = subscribeWithdrawState(refresh)
    const timer = setInterval(sync, SYNC_MS)

    return () => {
      unsub()
      clearInterval(timer)
    }
  }, [])

  return { withdrawn, record }
}
