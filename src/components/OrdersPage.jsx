import { useMemo, useState } from 'react'
import useOrders from '../hooks/useOrders'
import {
  ORDER_FILTERS,
  SECTION_TITLES,
  EMPTY_MESSAGES,
  filterOrders,
} from '../utils/ordersData'

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { orders, counts } = useOrders()

  const filteredOrders = useMemo(
    () => filterOrders(orders, activeFilter),
    [orders, activeFilter],
  )

  return (
    <>
      <div className="dhan-orders-summary">
        <div className="dhan-orders-stat">
          <span className="dhan-orders-stat-label">Total Orders</span>
          <span className="dhan-orders-stat-value">{counts.all}</span>
        </div>
        <div className="dhan-orders-stat">
          <span className="dhan-orders-stat-label">Executed</span>
          <span className="dhan-orders-stat-value dhan-orders-stat-green">{counts.executed}</span>
        </div>
        <div className="dhan-orders-stat">
          <span className="dhan-orders-stat-label">Pending</span>
          <span className="dhan-orders-stat-value dhan-orders-stat-pending">{counts.pending}</span>
        </div>
      </div>

      <div className="dhan-filters">
        <div className="dhan-filter-chips">
          {ORDER_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`dhan-chip${activeFilter === key ? ' active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {label}
              {counts[key] > 0 && (
                <span className={`dhan-chip-count${activeFilter !== key && key !== 'all' ? ' dhan-chip-count-muted' : ''}`}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="dhan-orders">
        <h2 className="dhan-section-title">{SECTION_TITLES[activeFilter]}</h2>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div className="dhan-order-card" key={order.id}>
              <div className="dhan-order-header">
                <span className="dhan-order-name">{order.name}</span>
                <span className={`dhan-order-status dhan-order-status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="dhan-order-details">
                <div className="dhan-order-left">
                  <span className={`dhan-side-badge ${order.side === 'S' ? 'dhan-sell-badge' : ''}`}>
                    {order.side}
                  </span>
                  <span className="dhan-normal-tag">{order.type}</span>
                  <span className="dhan-qty">
                    Qty. {order.qty.toLocaleString('en-IN')} x {order.price.toFixed(2)} {order.exchange}
                  </span>
                </div>
                <span className="dhan-order-time">
                  {order.date} · {order.time}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="dhan-empty-filter">{EMPTY_MESSAGES[activeFilter]}</p>
        )}
      </section>
    </>
  )
}
