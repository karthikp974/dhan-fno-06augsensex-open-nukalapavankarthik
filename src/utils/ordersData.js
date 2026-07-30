import { getExitInfo, getPositionPhase } from './marketLogic'
import { getCurrentTime } from './timeOverride'
function getSensexOrders(phase) {
  const exitInfo = getExitInfo()
  const buys = [
    {
      id: 1,
      name: 'SENSEX 06 Aug 74400 CALL',
      side: 'B',
      type: 'Normal',
      qty: 730,
      price: 196.0,
      exchange: 'BSE',
      status: 'Executed',
      date: '27 Jul 2026',
      time: '09:18 AM',
      sortKey: new Date('2026-07-27T09:18:00+05:30').getTime(),
    },
    {
      id: 2,
      name: 'SENSEX 06 Aug 74400 CALL',
      side: 'B',
      type: 'Normal',
      qty: 730,
      price: 196.0,
      exchange: 'BSE',
      status: 'Executed',
      date: '27 Jul 2026',
      time: '09:19 AM',
      sortKey: new Date('2026-07-27T09:19:00+05:30').getTime(),
    },
  ]

  const sell =
    phase === 'closed' && exitInfo
      ? {
          id: 3,
          name: 'SENSEX 06 Aug 74400 CALL',
          side: 'S',
          type: 'Normal',
          qty: 1460,
          price: exitInfo.sellPrice,
          exchange: 'BSE',
          status: 'Executed',
          date: exitInfo.date,
          time: exitInfo.time,
          sortKey: exitInfo.sortKey,
        }
      : {
          id: 3,
          name: 'SENSEX 06 Aug 74400 CALL',
          side: 'S',
          type: 'Normal',
          qty: 1460,
          price: 118.4,
          exchange: 'BSE',
          status: 'Pending',
          date: '06 Aug 2026',
          time: '09:15 AM',
          sortKey: new Date('2026-08-06T09:15:00+05:30').getTime(),
        }

  return [...buys, sell]
}

export function getAllOrders(now = getCurrentTime()) {
  const phase = getPositionPhase(now)
  return getSensexOrders(phase).sort((a, b) => b.sortKey - a.sortKey)
}

export function getOrderCounts(orders) {
  return {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    executed: orders.filter((o) => o.status === 'Executed').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  }
}

export function filterOrders(orders, filter) {
  if (filter === 'all') return orders
  const statusMap = {
    pending: 'Pending',
    executed: 'Executed',
    cancelled: 'Cancelled',
  }
  return orders.filter((o) => o.status === statusMap[filter])
}

export const ORDER_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'executed', label: 'Executed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export const SECTION_TITLES = {
  all: 'All Orders',
  pending: 'Pending Orders',
  executed: 'Executed Orders',
  cancelled: 'Cancelled Orders',
}

export const EMPTY_MESSAGES = {
  pending: 'No pending orders right now.',
  executed: 'No executed orders to show.',
  cancelled: 'No cancelled orders to show.',
  all: 'No orders found.',
}
