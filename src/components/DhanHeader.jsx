import { useState } from 'react'
import ProfilePanel from './ProfilePanel'

export default function DhanHeader({ activeTab, onTabChange, onWithdraw }) {
  const [showProfile, setShowProfile] = useState(false)

  const handleWithdraw = () => {
    setShowProfile(false)
    onWithdraw?.()
  }

  return (
    <header className="dhan-header">
      <div className="dhan-header-profile">
        <button
          type="button"
          className="dhan-avatar-btn"
          aria-label="Open profile"
          aria-expanded={showProfile}
          onClick={() => setShowProfile((open) => !open)}
        >
          <div className="dhan-avatar">NP</div>
        </button>
        {showProfile && (
          <ProfilePanel onClose={() => setShowProfile(false)} onWithdraw={handleWithdraw} />
        )}
      </div>
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
