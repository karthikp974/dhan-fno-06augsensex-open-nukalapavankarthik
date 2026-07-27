import { useState } from 'react'
import './PinGate.css'

const CORRECT_PIN = '6868'
const PIN_LENGTH = 4

export default function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const appendDigit = (digit) => {
    if (pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)
    setError(false)

    if (next.length === PIN_LENGTH) {
      if (next === CORRECT_PIN) {
        onUnlock()
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
    <div className="pin-gate" style={{ minHeight: '100vh', background: '#f0f0f0' }}>
      <div className={`pin-gate-card${error ? ' pin-gate-shake' : ''}`}>
        <div className="pin-gate-logo">NP</div>
        <h1 className="pin-gate-title">Enter PIN</h1>
        <p className="pin-gate-subtitle">Enter your 4-digit PIN to continue</p>

        <div className="pin-dots" aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <span key={i} className={`pin-dot${i < pin.length ? ' filled' : ''}`} />
          ))}
        </div>

        {error && <p className="pin-error">Incorrect PIN. Try again.</p>}

        <div className="pin-keypad">
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
    </div>
  )
}
