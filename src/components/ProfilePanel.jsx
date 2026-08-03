import { useEffect, useState } from 'react'
import { getISTGreeting } from '../utils/marketLogic'
import './ProfilePanel.css'

export default function ProfilePanel({ onClose, onWithdraw }) {
  const [greeting, setGreeting] = useState(() => getISTGreeting())

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

        <p className="dhan-profile-funds">
          <strong>Withdrawal in Progress</strong>
          <br />
          Your funds will be credited to your registered bank account ending in <strong>4588</strong> within <strong>24 hours</strong>.
        </p>

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