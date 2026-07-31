import { useEffect, useMemo, useState } from 'react'
import { ACCOUNT_FUNDS, formatPnL } from '../utils/marketLogic'
import {
  getWithdrawSlots,
  hasAvailableWithdrawSlots,
  requiresHighValueVerification,
  VERIFICATION_SLOT_ID,
  WITHDRAW_SLOT_NOTE,
} from '../utils/withdrawSlots'
import './WithdrawPage.css'

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', account: 'XXXX XXXX 4521', icon: 'HDFC' },
]

function parseAmount(raw) {
  const cleaned = String(raw).replace(/,/g, '').trim()
  if (!cleaned) return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

const SECURITY_QUESTIONS = [
  {
    id: 'mobile',
    label: 'Last 4 digits of registered mobile number',
    placeholder: 'Enter last 4 digits',
  },
  {
    id: 'pan',
    label: 'Last 4 characters of PAN',
    placeholder: 'e.g. 1234',
  },
]

export default function WithdrawPage({ onBack }) {
  const [step, setStep] = useState('amount')
  const [amountRaw, setAmountRaw] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [selectedBankId, setSelectedBankId] = useState(BANKS[0].id)
  const [faceVerified, setFaceVerified] = useState(false)
  const [answers, setAnswers] = useState({ mobile: '', pan: '' })
  const [slots, setSlots] = useState(() => getWithdrawSlots())

  useEffect(() => {
    const sync = () => setSlots(getWithdrawSlots())
    sync()
    const timer = setInterval(sync, 30_000)
    return () => clearInterval(timer)
  }, [])

  const amount = parseAmount(amountRaw)
  const availableFormatted = formatPnL(ACCOUNT_FUNDS)
  const amountError = useMemo(() => {
    if (amount === null) return amountRaw.trim() ? 'Enter a valid amount' : null
    if (amount <= 0) return 'Amount must be greater than zero'
    if (amount > ACCOUNT_FUNDS) return 'Amount exceeds available balance'
    return null
  }, [amount, amountRaw])

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId)
  const availableSlots = slots.filter((slot) => slot.available)
  const needsVerification = requiresHighValueVerification(amount)
  const canProceedAmount = amount !== null && !amountError
  const canProceedSlot = Boolean(selectedSlot)
  const canProceedVerify =
    faceVerified && answers.mobile.trim().length === 4 && answers.pan.trim().length === 4
  const canConfirm = Boolean(selectedBankId)

  const handleAmountChange = (event) => {
    const next = event.target.value.replace(/[^\d.]/g, '')
    setAmountRaw(next)
  }

  const setQuickAmount = (value) => {
    setAmountRaw(String(value))
  }

  const goToSlots = () => {
    if (!canProceedAmount) return
    if (!hasAvailableWithdrawSlots()) return
    setSelectedSlotId(VERIFICATION_SLOT_ID)
    setStep('slot')
  }

  const goAfterSlot = () => {
    if (!canProceedSlot) return
    if (needsVerification) setStep('verify')
    else setStep('bank')
  }

  const goToBank = () => {
    if (needsVerification && !canProceedVerify) return
    setStep('bank')
  }

  const confirmWithdrawal = () => {
    if (!canConfirm) return
    setStep('success')
  }

  const handleBack = () => {
    if (step === 'slot') setStep('amount')
    else if (step === 'verify') setStep('slot')
    else if (step === 'bank') setStep(needsVerification ? 'verify' : 'slot')
    else if (step === 'success') onBack()
    else onBack()
  }

  const renderAmountStep = () => (
    <>
      <div className="dhan-withdraw-balance-card">
        <div className="dhan-withdraw-balance-label">Available to withdraw</div>
        <div className="dhan-withdraw-balance-value">
          <span className="dhan-withdraw-rupee">₹</span>
          {availableFormatted}
        </div>
      </div>

      <div className="dhan-withdraw-field-label">Enter amount to withdraw</div>
      <div
        className={`dhan-withdraw-amount-wrap${amountError ? ' dhan-withdraw-input-error' : ''}`}
      >
        <span className="dhan-withdraw-amount-symbol">₹</span>
        <input
          className="dhan-withdraw-amount-input"
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={amountRaw}
          onChange={handleAmountChange}
        />
      </div>

      <div className="dhan-withdraw-quick">
        <button type="button" className="dhan-withdraw-quick-btn" onClick={() => setQuickAmount(ACCOUNT_FUNDS)}>
          Full amount
        </button>
        <button type="button" className="dhan-withdraw-quick-btn" onClick={() => setQuickAmount(500000)}>
          ₹5,00,000
        </button>
        <button type="button" className="dhan-withdraw-quick-btn" onClick={() => setQuickAmount(200000)}>
          ₹2,00,000
        </button>
      </div>

      {amountError && <p className="dhan-withdraw-error">{amountError}</p>}

      {!hasAvailableWithdrawSlots() && (
        <p className="dhan-withdraw-error">
          Withdrawal slots are closed for today (after 3:30 PM IST). Please try again tomorrow.
        </p>
      )}
    </>
  )

  const renderSlotStep = () => (
    <>
      <div className="dhan-withdraw-summary">
        <div className="dhan-withdraw-summary-row">
          <span className="dhan-withdraw-summary-label">Withdrawal amount</span>
          <span className="dhan-withdraw-summary-value">₹{formatPnL(amount)}</span>
        </div>
      </div>

      <div className="dhan-withdraw-info">
        <p className="dhan-withdraw-info-title">Why this slot?</p>
        <p className="dhan-withdraw-info-text">{WITHDRAW_SLOT_NOTE}</p>
      </div>

      <h2 className="dhan-withdraw-slots-title">Select a slot</h2>

      {availableSlots.length === 0 ? (
        <p className="dhan-withdraw-empty">
          No slots available right now. All 30-minute slots for today (till 3:30 PM IST) are full or
          closed.
        </p>
      ) : (
        <div className="dhan-withdraw-slot-list">
          {slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={`dhan-withdraw-slot${selectedSlotId === slot.id ? ' selected' : ''}`}
              disabled={!slot.available}
              onClick={() => setSelectedSlotId(slot.id)}
            >
              <div>
                <div className="dhan-withdraw-slot-time">{slot.label}</div>
                <div className="dhan-withdraw-slot-meta">
                  {slot.verificationSlot && slot.available
                    ? 'Available · Face verification required'
                    : slot.isCurrent
                      ? 'Current slot'
                      : slot.available
                        ? 'Available'
                        : 'Slot closed'}
                </div>
              </div>
              <span className="dhan-withdraw-slot-radio" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </>
  )

  const renderVerifyStep = () => (
    <>
      <div className="dhan-withdraw-summary">
        <div className="dhan-withdraw-summary-row">
          <span className="dhan-withdraw-summary-label">Withdrawal amount</span>
          <span className="dhan-withdraw-summary-value">₹{formatPnL(amount)}</span>
        </div>
        <div className="dhan-withdraw-summary-row">
          <span className="dhan-withdraw-summary-label">Verification slot</span>
          <span className="dhan-withdraw-summary-value">{selectedSlot?.label}</span>
        </div>
      </div>

      <div className="dhan-withdraw-info">
        <p className="dhan-withdraw-info-title">High-value withdrawal</p>
        <p className="dhan-withdraw-info-text">
          Amounts above ₹8 lakh need facial recognition and security questions before payout. Complete
          both steps below during your 3:00 PM – 3:30 PM slot.
        </p>
      </div>

      <div className="dhan-withdraw-verify-block">
        <h2 className="dhan-withdraw-slots-title">Facial recognition</h2>
        <div className={`dhan-withdraw-face${faceVerified ? ' verified' : ''}`}>
          <div className="dhan-withdraw-face-icon" aria-hidden="true">
            {faceVerified ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l5 5L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <p className="dhan-withdraw-face-label">
            {faceVerified ? 'Face verified successfully' : 'Position your face in the frame'}
          </p>
          {!faceVerified && (
            <button type="button" className="dhan-withdraw-face-btn" onClick={() => setFaceVerified(true)}>
              Start Face Verification
            </button>
          )}
        </div>
      </div>

      <div className="dhan-withdraw-verify-block">
        <h2 className="dhan-withdraw-slots-title">Security questions</h2>
        {SECURITY_QUESTIONS.map((question) => (
          <label key={question.id} className="dhan-withdraw-question">
            <span className="dhan-withdraw-question-label">{question.label}</span>
            <input
              className="dhan-withdraw-question-input"
              type="text"
              maxLength={4}
              placeholder={question.placeholder}
              value={answers[question.id]}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.id]: event.target.value.replace(/\s/g, '').toUpperCase(),
                }))
              }
            />
          </label>
        ))}
      </div>
    </>
  )

  const renderBankStep = () => (
    <>
      <div className="dhan-withdraw-summary">
        <div className="dhan-withdraw-summary-row">
          <span className="dhan-withdraw-summary-label">Amount</span>
          <span className="dhan-withdraw-summary-value">₹{formatPnL(amount)}</span>
        </div>
        <div className="dhan-withdraw-summary-row">
          <span className="dhan-withdraw-summary-label">Payout slot</span>
          <span className="dhan-withdraw-summary-value">{selectedSlot?.label}</span>
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

      <div className="dhan-withdraw-info" style={{ marginTop: 16 }}>
        <p className="dhan-withdraw-info-text" style={{ margin: 0 }}>
          Funds will be credited to your selected bank account within the chosen 30-minute slot on a
          best-effort basis.
        </p>
      </div>
    </>
  )

  const renderSuccessStep = () => (
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
        ₹{formatPnL(amount)} will be transferred to your {BANKS.find((b) => b.id === selectedBankId)?.name}{' '}
        account during the {selectedSlot?.label} slot.
      </p>
    </div>
  )

  const titles = {
    amount: 'Withdraw to Bank',
    slot: 'Select Slot',
    verify: 'Verify Identity',
    bank: 'Confirm Withdrawal',
    success: 'Withdraw to Bank',
  }

  const footer = (() => {
    if (step === 'amount') {
      return (
        <button
          type="button"
          className="dhan-withdraw-cta"
          disabled={!canProceedAmount || !hasAvailableWithdrawSlots()}
          onClick={goToSlots}
        >
          Proceed to Next
        </button>
      )
    }
    if (step === 'slot') {
      return (
        <button
          type="button"
          className="dhan-withdraw-cta"
          disabled={!canProceedSlot}
          onClick={goAfterSlot}
        >
          Proceed to Next
        </button>
      )
    }
    if (step === 'verify') {
      return (
        <button
          type="button"
          className="dhan-withdraw-cta"
          disabled={!canProceedVerify}
          onClick={goToBank}
        >
          Proceed to Next
        </button>
      )
    }
    if (step === 'bank') {
      return (
        <button type="button" className="dhan-withdraw-cta" disabled={!canConfirm} onClick={confirmWithdrawal}>
          Confirm Withdrawal Request
        </button>
      )
    }
    return (
      <button type="button" className="dhan-withdraw-cta" onClick={onBack}>
        Done
      </button>
    )
  })()

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
        {step === 'amount' && renderAmountStep()}
        {step === 'slot' && renderSlotStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'bank' && renderBankStep()}
        {step === 'success' && renderSuccessStep()}
      </div>

      {step !== 'success' && <div className="dhan-withdraw-footer">{footer}</div>}
      {step === 'success' && <div className="dhan-withdraw-footer">{footer}</div>}
    </div>
  )
}
