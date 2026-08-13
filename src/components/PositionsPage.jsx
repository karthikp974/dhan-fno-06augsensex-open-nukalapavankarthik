import { useEffect, useRef, useState } from 'react'
import useLivePnL from '../hooks/useLivePnL'
import PnlEditorPanel from './PnlEditorPanel'

const TAP_TARGET = 7
const TAP_RESET_MS = 2500

export default function PositionsPage() {
  const {
    pnl,
    formattedPnL,
    isProfit,
    isRunning,
    isLive,
    sectionTitle,
    shuffleEnabled,
    applyOverride,
    hasOpenPosition,
    positionCount,
  } = useLivePnL()

  const [activeFilter, setActiveFilter] = useState('all')
  const [pnlBump, setPnlBump] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  const tapCountRef = useRef(0)
  const tapTimerRef = useRef(null)

  useEffect(() => {
    if (!isLive) return undefined

    setPnlBump(true)

    const timer = setTimeout(() => setPnlBump(false), 400)

    return () => clearTimeout(timer)
  }, [pnl, isLive])

  const pnlClass = isProfit ? 'dhan-pnl-positive' : 'dhan-pnl-negative'

  const handlePnlTap = () => {
    if (!isProfit) return

    tapCountRef.current += 1

    clearTimeout(tapTimerRef.current)

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0
    }, TAP_RESET_MS)

    if (tapCountRef.current >= TAP_TARGET) {
      tapCountRef.current = 0
      clearTimeout(tapTimerRef.current)
      setShowEditor(true)
    }
  }

  const showPosition =
    hasOpenPosition &&
    (activeFilter === 'all' ||
      (activeFilter === 'profit' && isProfit) ||
      (activeFilter === 'loss' && !isProfit))

  return (
    <>
      <div className={`dhan-pnl-card ${pnlClass}`}>
        <div className="dhan-pnl-bg">
          <svg
            className="dhan-pnl-wave"
            viewBox="0 0 360 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 Q90,40 180,70 T360,50 L360,120 L0,120 Z"
              fill={
                isProfit
                  ? 'rgba(88,155,55,0.06)'
                  : 'rgba(229,57,53,0.06)'
              }
            />

            <path
              d="M0,90 Q120,50 240,80 T360,60 L360,120 L0,120 Z"
              fill={
                isProfit
                  ? 'rgba(88,155,55,0.04)'
                  : 'rgba(229,57,53,0.04)'
              }
            />
          </svg>

          <div className="dhan-pnl-watermark">₹</div>
        </div>

        <div className="dhan-pnl-content">
          <div className="dhan-pnl-top">
            <span className="dhan-pnl-label">
              Overall P&amp;L
            </span>
          </div>

          <div className="dhan-pnl-amount">
            <span className={`dhan-rupee ${pnlClass}`}>
              ₹
            </span>

            <span
              className={`dhan-pnl-value ${pnlClass}${
                isLive ? ' dhan-pnl-live' : ''
              }${pnlBump ? ' dhan-pnl-bump' : ''}${
                isProfit ? ' dhan-pnl-tappable' : ''
              }`}
              onClick={handlePnlTap}
              role={isProfit ? 'button' : undefined}
              tabIndex={isProfit ? 0 : undefined}
            >
              {formattedPnL}
            </span>

            <span className="dhan-pnl-positions">
              on {positionCount} positions
            </span>
          </div>
        </div>
      </div>

      <div className="dhan-filters">
        <div className="dhan-filter-chips">
          <button
            className={`dhan-chip${
              activeFilter === 'all' ? ' active' : ''
            }`}
            onClick={() => setActiveFilter('all')}
          >
            All <span className="dhan-chip-count">{positionCount}</span>
          </button>

          <button
            className={`dhan-chip${
              activeFilter === 'profit' ? ' active' : ''
            }`}
            onClick={() => setActiveFilter('profit')}
          >
            In Profits
          </button>

          <button
            className={`dhan-chip${
              activeFilter === 'loss' ? ' active' : ''
            }`}
            onClick={() => setActiveFilter('loss')}
          >
            In Loss
          </button>
        </div>
      </div>

      <section className="dhan-positions">
        <h2 className="dhan-section-title">
          {sectionTitle}
        </h2>

        {showPosition ? (
          <div className="dhan-position-card">
            <div className="dhan-position-header">
              <span className="dhan-position-name">
                SENSEX 06 Aug 74400 CALL
              </span>

              <span
                className={`dhan-position-pnl ${pnlClass}${
                  isLive ? ' dhan-pnl-live' : ''
                }${pnlBump ? ' dhan-pnl-bump' : ''}`}
              >
                {formattedPnL}
              </span>
            </div>

            <div className="dhan-position-details">
              <div className="dhan-position-left">
                <span className="dhan-buy-badge">
                  B
                </span>

                <span className="dhan-normal-tag">
                  Normal
                </span>

                <span className="dhan-qty">
                  Qty. 1,460 × 196.00 BSE
                </span>
              </div>

              <span className="dhan-status dhan-status-running">
                Running
              </span>
            </div>
          </div>
        ) : (
          <p className="dhan-empty-filter">
            {hasOpenPosition
              ? `No positions ${activeFilter === 'profit' ? 'in profit' : 'in loss'} right now.`
              : 'No open positions right now.'}
          </p>
        )}
      </section>

      {showEditor && (
        <PnlEditorPanel
          currentPnl={pnl}
          shuffleEnabled={shuffleEnabled}
          onApply={applyOverride}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  )
}