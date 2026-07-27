import { useEffect, useState } from 'react'
import { getAllOrders, getOrderCounts } from '../utils/ordersData'
import { subscribePositionExit } from '../utils/positionExit'
export default function useOrders() {
  const [orders, setOrders] = useState(() => getAllOrders())
  const [counts, setCounts] = useState(() => getOrderCounts(getAllOrders()))

  useEffect(() => {
    const update = () => {
      const next = getAllOrders()
      setOrders(next)
      setCounts(getOrderCounts(next))
    }
    update()
    const interval = setInterval(update, 1000)
    const unsubExit = subscribePositionExit(update)
    return () => {
      clearInterval(interval)
      unsubExit()
    }
  }, [])

  return { orders, counts }
}
