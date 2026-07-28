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
    phase,
    sectionTitle,
    statusLabel,
    exitInfo,
    exitPosition,
    shuffleEnabled,
    applyOverride,
  } = useLivePnL()
  const [activeFilter, setActiveFilter] = useState('all')
  const [positionSelected, setPositionSelected] = useState(false)
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

  const handleExit = () => {
    const message = `Exit SENSEX 06 Aug 74400 CALL at current P&L of ₹ ${formattedPnL}?`
    if (window.confirm(message)) {
      exitPosition()
      setPositionSelected(false)
    }
  }

  const handlePositionTap = () => {
    if (isRunning) {
      setPositionSelected((prev) => !prev)
    }
  }

  const showPosition =
    activeFilter === 'all' ||
    (activeFilter === 'profit' && isProfit) ||
    (activeFilter === 'loss' && !isProfit)
  return (
    <>
      <div className={`dhan-pnl-card ${pnlClass}`}>
        <div className="dhan-pnl-bg">
          <svg className="dhan-pnl-wave" viewBox="0 0 360 120" preserveAspectRatio="none">
            <path
              d="M0,80 Q90,40 180,70 T360,50 L360,120 L0,120 Z"
              fill={isProfit ? 'rgba(88,155,55,0.06)' : 'rgba(229,57,53,0.06)'}
            />
            <path
              d="M0,90 Q120,50 240,80 T360,60 L360,120 L0,120 Z"
              fill={isProfit ? 'rgba(88,155,55,0.04)' : 'rgba(229,57,53,0.04)'}
            />
          </svg>
          <div className="dhan-pnl-watermark">₹</div>
        </div>
        <div className="dhan-pnl-content">
          <div className="dhan-pnl-top">
            <span className="dhan-pnl-label">Overall P&L</span>
          </div>
          <div className="dhan-pnl-amount">
            <span className={`dhan-rupee ${pnlClass}`}>₹</span>
            <span
              className={`dhan-pnl-value ${pnlClass}${isLive ? ' dhan-pnl-live' : ''}${pnlBump ? ' dhan-pnl-bump' : ''}${isProfit ? ' dhan-pnl-tappable' : ''}`}
              onClick={handlePnlTap}
              role={isProfit ? 'button' : undefined}
              tabIndex={isProfit ? 0 : undefined}
            >
              {formattedPnL}
            </span>
            <span className="dhan-pnl-positions">on 1 positions</span>
          </div>
          <div className="dhan-pnl-verified">
            <span className="dhan-verified-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#2196F3" />
                <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>
              {isLive
                ? phase === 'profit'
                  ? 'Live P&L shuffling ±₹5,000 around current value.'
                  : phase === 'tuesday_shuffle'
                    ? 'Live P&L shuffling ±₹5,000 around ₹7,80,000 until 3:30 PM IST.'
                    : 'Live P&L shuffling ±₹5,000 toward max loss ₹2,86,160 by 3:30 PM.'
                : isRunning
                  ? !shuffleEnabled
                    ? 'P&L shuffle paused. Tap profit 7× to edit.'
                    : phase === 'profit' || phase === 'tuesday_shuffle'
                    ? phase === 'tuesday_shuffle'
                      ? 'Today\'s P&L closed after 3:30 PM IST.'
                      : 'Today\'s P&L closed at ₹8,37,000.00 after 3:29 PM IST.'
                    : 'Max loss capped at ₹2,86,160. Closed for today after 3:30 PM.'
                  : exitInfo
                    ? `Position exited on ${exitInfo.date} at ${exitInfo.time}. Verified by Dhan.`
                    : 'Position squared off on 06 Aug. Verified by Dhan.'}
            </span>
          </div>
        </div>
      </div>

      <div className="dhan-filters">
        <div className="dhan-filter-chips">
          <button
            className={`dhan-chip${activeFilter === 'all' ? ' active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All <span className="dhan-chip-count">1</span>
          </button>
          <button
            className={`dhan-chip${activeFilter === 'profit' ? ' active' : ''}`}
            onClick={() => setActiveFilter('profit')}
          >
            In Profits
          </button>
          <button
            className={`dhan-chip${activeFilter === 'loss' ? ' active' : ''}`}
            onClick={() => setActiveFilter('loss')}
          >
            In Loss
          </button>
        </div>
        <div className="dhan-filter-actions">
          <button className="dhan-icon-btn" aria-label="Sort">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 6l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button className="dhan-icon-btn" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <section className="dhan-positions">
        <h2 className="dhan-section-title">{sectionTitle}</h2>
        {showPosition ? (
          <div
            className={`dhan-position-card${positionSelected && isRunning ? ' selected' : ''}${isRunning ? ' tappable' : ''}`}
            onClick={handlePositionTap}
            role={isRunning ? 'button' : undefined}
            tabIndex={isRunning ? 0 : undefined}
            onKeyDown={(e) => {
              if (isRunning && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handlePositionTap()
              }
            }}
          >
            <div className="dhan-position-header">
              <span className="dhan-position-name">SENSEX 06 Aug 74400 CALL</span>
              <span
                className={`dhan-position-pnl ${pnlClass}${isLive ? ' dhan-pnl-live' : ''}${pnlBump ? ' dhan-pnl-bump' : ''}`}
              >
                {formattedPnL}
              </span>
            </div>
            <div className="dhan-position-details">
              <div className="dhan-position-left">
                <span className="dhan-buy-badge">B</span>
                <span className="dhan-normal-tag">Normal</span>
                <span className="dhan-qty">Qty. 1,460 x 196.00 BSE</span>
              </div>
              <span className={`dhan-status${isRunning ? ' dhan-status-running' : ''}`}>
                {statusLabel}
              </span>
            </div>
            {isRunning && positionSelected && (
              <button
                className="dhan-exit-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleExit()
                }}
              >
                Exit
              </button>
            )}
          </div>
        ) : (
          <p className="dhan-empty-filter">
            No positions {activeFilter === 'profit' ? 'in profit' : 'in loss'} right now.
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
