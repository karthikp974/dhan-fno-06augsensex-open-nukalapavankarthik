import { useEffect, useState } from 'react'
import { ACCOUNT_FUNDS, formatPnL, getISTGreeting } from '../utils/marketLogic'
import './ProfilePanel.css'

export default function ProfilePanel({ onClose }) {
  const [greeting, setGreeting] = useState(() => getISTGreeting())

  useEffect(() => {
    const sync = () => setGreeting(getISTGreeting())
    sync()
    const timer = setInterval(sync, 60_000)
    return () => clearInterval(timer)
  }, [])

  const funds = formatPnL(ACCOUNT_FUNDS)

  return (
    <>
      <div className="dhan-profile-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="dhan-profile-panel" role="dialog" aria-label="Profile">
        <div className="dhan-profile-logo">NP</div>
        <p className="dhan-profile-greeting">{greeting}</p>
        <p className="dhan-profile-funds">
          Funds in your account <span className="dhan-profile-funds-amount">{funds}</span>
        </p>
      </div>
    </>
  )
}
