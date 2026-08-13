import { formatPnL, getAccountFunds } from '../utils/marketLogic'
import './WithdrawPage.css'

const WITHDRAW_PENDING_NOTE =
  'Amount will be available for withdrawal after 24 hours (1:36 PM).'

export default function WithdrawPage({ onBack }) {
  const accountFunds = getAccountFunds()
  const availableFormatted = formatPnL(accountFunds)

  return (
    <div className="dhan-withdraw">
      <div className="dhan-withdraw-top">
        <button type="button" className="dhan-withdraw-back" aria-label="Go back" onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="dhan-withdraw-title">Withdraw to Bank</h1>
      </div>

      <div className="dhan-withdraw-body">
        <div className="dhan-withdraw-balance-card">
          <div className="dhan-withdraw-balance-label">Available balance</div>
          <div className="dhan-withdraw-balance-value">
            <span className="dhan-withdraw-rupee">₹</span>
            {availableFormatted}
          </div>
        </div>

        <div className="dhan-withdraw-info">
          <p className="dhan-withdraw-info-title">Withdrawal pending</p>
          <p className="dhan-withdraw-info-text">{WITHDRAW_PENDING_NOTE}</p>
        </div>
      </div>
    </div>
  )
}
