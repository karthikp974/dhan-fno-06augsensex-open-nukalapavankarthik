export default function DhanHeader({ activeTab, onTabChange }) {
  return (
    <header className="dhan-header">
      <div className="dhan-avatar">NP</div>
      <nav className="dhan-tabs">
        <button
          className={`dhan-tab${activeTab === 'positions' ? ' active' : ''}`}
          onClick={() => onTabChange('positions')}
        >
          Positions
        </button>
        <button
          className={`dhan-tab${activeTab === 'orders' ? ' active' : ''}`}
          onClick={() => onTabChange('orders')}
        >
          Orders
        </button>
      </nav>
    </header>
  )
}
