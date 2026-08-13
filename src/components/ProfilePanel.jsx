import { useEffect, useState } from 'react'
import { formatPnL, getAccountFunds, getISTGreeting } from '../utils/marketLogic'
import './ProfilePanel.css'

export default function ProfilePanel({ onClose, onWithdraw }) {
  const [greeting, setGreeting] = useState(() => getISTGreeting())
  const [showWithdrawDetails, setShowWithdrawDetails] = useState(false)
  const balance = formatPnL(getAccountFunds())

  useEffect(() => {
    const sync = () => setGreeting(getISTGreeting())
    sync()
    const timer = setInterval(sync, 60_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <div className="dhan-profile-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="dhan-profile-panel" role="dialog" aria-label="Profile">
        <div className="dhan-profile-logo">NP</div>

        <p className="dhan-profile-greeting">{greeting}</p>

        <button
          type="button"
          className="dhan-profile-balance-btn"
          onClick={() => setShowWithdrawDetails((open) => !open)}
          aria-expanded={showWithdrawDetails}
        >
          <span className="dhan-profile-balance-label">Available Balance</span>
          <span className="dhan-profile-balance-value">₹{balance}</span>
          <span className="dhan-profile-balance-hint">
            {showWithdrawDetails ? 'Hide details' : 'Tap for withdrawal details'}
          </span>
        </button>

        {showWithdrawDetails && (
          <p className="dhan-profile-funds">
            <strong>Withdrawal in Progress</strong>
            <br />
            Amount will be available for withdrawal after <strong>24 hours (1:36 PM)</strong>.
          </p>
        )}

        <button
          type="button"
          className="dhan-profile-withdraw-btn"
          onClick={onWithdraw}
        >
          Withdraw Funds
        </button>
      </div>
    </>
  )
}