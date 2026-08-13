import { useEffect, useState } from 'react'
import {
  formatPnL,
  getAccountFunds,
  getISTGreeting,
  isWithdrawAvailable,
  WITHDRAW_CREDIT_MESSAGE,
  WITHDRAW_PENDING_NOTE,
} from '../utils/marketLogic'
import useWithdrawState from '../hooks/useWithdrawState'
import './ProfilePanel.css'

export default function ProfilePanel({ onClose, onWithdraw }) {
  const [greeting, setGreeting] = useState(() => getISTGreeting())
  const [showWithdrawDetails, setShowWithdrawDetails] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(() => isWithdrawAvailable())
  const { withdrawn } = useWithdrawState()
  const balance = formatPnL(getAccountFunds())

  useEffect(() => {
    const sync = () => {
      setGreeting(getISTGreeting())
      setWithdrawOpen(isWithdrawAvailable())
    }
    sync()
    const timer = setInterval(sync, 10_000)
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
          onClick={() => !withdrawn && setShowWithdrawDetails((open) => !open)}
          aria-expanded={showWithdrawDetails}
        >
          <span className="dhan-profile-balance-label">Available Balance</span>
          <span className="dhan-profile-balance-value">₹{balance}</span>
          <span className="dhan-profile-balance-hint">
            {!withdrawn &&
              !withdrawOpen &&
              (showWithdrawDetails ? 'Hide details' : 'Tap for withdrawal details')}
          </span>
        </button>

        {showWithdrawDetails && !withdrawOpen && !withdrawn && (
          <p className="dhan-profile-funds">
            <strong>Withdrawal in Progress</strong>
            <br />
            {WITHDRAW_PENDING_NOTE}
          </p>
        )}

        {withdrawn && (
          <p className="dhan-profile-funds">
            <strong>Withdrawal Completed</strong>
            <br />
            {WITHDRAW_CREDIT_MESSAGE}
          </p>
        )}

        {withdrawOpen && !withdrawn && (
          <button
            type="button"
            className="dhan-profile-withdraw-btn"
            onClick={onWithdraw}
          >
            Withdraw Funds
          </button>
        )}
      </div>
    </>
  )
}
