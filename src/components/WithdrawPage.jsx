import { useEffect, useState } from 'react'
import {
  formatPnL,
  getAccountFunds,
  isWithdrawAvailable,
  SETTLED_ACCOUNT_FUNDS,
  WITHDRAW_CREDIT_MESSAGE,
  WITHDRAW_PENDING_NOTE,
} from '../utils/marketLogic'
import { markFundsWithdrawn } from '../utils/withdrawState'
import useWithdrawState from '../hooks/useWithdrawState'
import './WithdrawPage.css'
import './PinGate.css'

const CORRECT_PIN = '6868'
const PIN_LENGTH = 4

const BANKS = [
  { id: 'hdfc', name: 'HDFC BANK', account: 'XXXX4588', icon: 'HDFC' },
  {
    id: 'kotak',
    name: 'KOTAK MAHINDRA BANK LIMITED',
    account: 'XXXX$%**',
    icon: 'KOTAK',
  },
]

function WithdrawPin({ onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const appendDigit = (digit) => {
    if (pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)
    setError(false)

    if (next.length === PIN_LENGTH) {
      if (next === CORRECT_PIN) {
        onSuccess()
      } else {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
        }, 600)
      }
    }
  }

  const backspace = () => {
    setPin((prev) => prev.slice(0, -1))
    setError(false)
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className={`dhan-withdraw-pin${error ? ' dhan-withdraw-pin-shake' : ''}`}>
      <p className="dhan-withdraw-pin-label">Enter your 4-digit PIN to confirm withdrawal</p>

      <div className="pin-dots" aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span key={i} className={`pin-dot${i < pin.length ? ' filled' : ''}`} />
        ))}
      </div>

      {error && <p className="pin-error">Incorrect PIN. Try again.</p>}

      <div className="pin-keypad dhan-withdraw-pin-keypad">
        {digits.map((key, i) => {
          if (key === '') {
            return <span key={i} className="pin-key pin-key-empty" />
          }
          if (key === 'del') {
            return (
              <button
                key={i}
                type="button"
                className="pin-key pin-key-action"
                onClick={backspace}
                aria-label="Delete"
              >
                ⌫
              </button>
            )
          }
          return (
            <button
              key={i}
              type="button"
              className="pin-key"
              onClick={() => appendDigit(key)}
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WithdrawCompleted({ record, onBack }) {
  const amount = record?.amount ?? SETTLED_ACCOUNT_FUNDS
  const bankName = record?.bankName ?? 'your bank'
  const bankAccount = record?.bankAccount ?? ''
  const amountFormatted = formatPnL(amount)

  return (
    <>
      <div className="dhan-withdraw-body">
        <div className="dhan-withdraw-balance-card">
          <div className="dhan-withdraw-balance-label">Available balance</div>
          <div className="dhan-withdraw-balance-value">
            <span className="dhan-withdraw-rupee">₹</span>
            0.00
          </div>
        </div>

        <div className="dhan-withdraw-success">
          <div className="dhan-withdraw-success-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l5 5L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="dhan-withdraw-success-title">Withdrawal request placed</h2>
          <p className="dhan-withdraw-success-text">
            ₹{amountFormatted} will be transferred to your {bankName} account
            {bankAccount ? ` (${bankAccount})` : ''}.
          </p>
          <p className="dhan-withdraw-success-text">{WITHDRAW_CREDIT_MESSAGE}</p>
        </div>
      </div>

      <div className="dhan-withdraw-footer">
        <button type="button" className="dhan-withdraw-cta" onClick={onBack}>
          Done
        </button>
      </div>
    </>
  )
}

export default function WithdrawPage({ onBack }) {
  const [withdrawOpen, setWithdrawOpen] = useState(() => isWithdrawAvailable())
  const [step, setStep] = useState('bank')
  const [selectedBankId, setSelectedBankId] = useState(null)
  const { withdrawn, record } = useWithdrawState()

  const accountFunds = getAccountFunds()
  const availableFormatted = formatPnL(accountFunds)
  const selectedBank = BANKS.find((bank) => bank.id === selectedBankId)

  useEffect(() => {
    const sync = () => setWithdrawOpen(isWithdrawAvailable())
    sync()
    const timer = setInterval(sync, 10_000)
    return () => clearInterval(timer)
  }, [])

  const handleBack = () => {
    if (step === 'pin') setStep('bank')
    else onBack()
  }

  const handleWithdrawSuccess = async () => {
    if (!selectedBank) return

    await markFundsWithdrawn({
      amount: SETTLED_ACCOUNT_FUNDS,
      bankId: selectedBank.id,
      bankName: selectedBank.name,
      bankAccount: selectedBank.account,
    })
    setStep('success')
  }

  const titles = {
    bank: 'Select Bank',
    pin: 'Enter PIN',
    success: 'Withdraw to Bank',
  }

  if (withdrawn) {
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
        <WithdrawCompleted record={record} onBack={onBack} />
      </div>
    )
  }

  if (!withdrawOpen) {
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

  return (
    <div className="dhan-withdraw">
      <div className="dhan-withdraw-top">
        <button type="button" className="dhan-withdraw-back" aria-label="Go back" onClick={handleBack}>
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
        <h1 className="dhan-withdraw-title">{titles[step]}</h1>
      </div>

      <div className="dhan-withdraw-body">
        {step === 'bank' && (
          <>
            <div className="dhan-withdraw-balance-card">
              <div className="dhan-withdraw-balance-label">Withdrawal amount</div>
              <div className="dhan-withdraw-balance-value">
                <span className="dhan-withdraw-rupee">₹</span>
                {availableFormatted}
              </div>
            </div>

            <h2 className="dhan-withdraw-slots-title">Select bank account</h2>
            <div className="dhan-withdraw-bank-list">
              {BANKS.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  className={`dhan-withdraw-bank${selectedBankId === bank.id ? ' selected' : ''}`}
                  onClick={() => setSelectedBankId(bank.id)}
                >
                  <div className="dhan-withdraw-bank-icon">{bank.icon}</div>
                  <div>
                    <div className="dhan-withdraw-bank-name">{bank.name}</div>
                    <div className="dhan-withdraw-bank-ac">{bank.account}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'pin' && selectedBank && (
          <>
            <div className="dhan-withdraw-summary">
              <div className="dhan-withdraw-summary-row">
                <span className="dhan-withdraw-summary-label">Amount</span>
                <span className="dhan-withdraw-summary-value">₹{availableFormatted}</span>
              </div>
              <div className="dhan-withdraw-summary-row">
                <span className="dhan-withdraw-summary-label">Bank</span>
                <span className="dhan-withdraw-summary-value">{selectedBank.name}</span>
              </div>
              <div className="dhan-withdraw-summary-row">
                <span className="dhan-withdraw-summary-label">Account</span>
                <span className="dhan-withdraw-summary-value">{selectedBank.account}</span>
              </div>
            </div>

            <WithdrawPin onSuccess={handleWithdrawSuccess} />
          </>
        )}

        {step === 'success' && selectedBank && (
          <div className="dhan-withdraw-success">
            <div className="dhan-withdraw-success-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l5 5L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="dhan-withdraw-success-title">Withdrawal request placed</h2>
            <p className="dhan-withdraw-success-text">
              ₹{formatPnL(SETTLED_ACCOUNT_FUNDS)} will be transferred to your {selectedBank.name}{' '}
              account ({selectedBank.account}).
            </p>
            <p className="dhan-withdraw-success-text">{WITHDRAW_CREDIT_MESSAGE}</p>
          </div>
        )}
      </div>

      {step === 'bank' && (
        <div className="dhan-withdraw-footer">
          <button
            type="button"
            className="dhan-withdraw-cta"
            disabled={!selectedBankId}
            onClick={() => setStep('pin')}
          >
            Proceed
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="dhan-withdraw-footer">
          <button type="button" className="dhan-withdraw-cta" onClick={onBack}>
            Done
          </button>
        </div>
      )}
    </div>
  )
}
