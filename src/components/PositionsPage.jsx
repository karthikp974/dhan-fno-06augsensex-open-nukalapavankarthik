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
    shuffleEnabled,
    applyOverride,
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
    activeFilter === 'all' ||
    (activeFilter === 'profit' && isProfit) ||
    (activeFilter === 'loss' && !isProfit)

  const statusMessage = (() => {
    if (isLive) {
      if (phase === 'profit') return 'Live P&L shuffling ±₹5,000 around current value.'
      if (phase === 'tuesday_shuffle') {
        return 'Live P&L shuffling ±₹5,000, closing at ₹7,20,000 by 3:15 PM IST.'
      }
      if (phase === 'decline') {
        return 'Live P&L shuffling ±₹5,000 from ₹1,27,839 toward max loss by 3:15 PM IST.'
      }
      return 'Live P&L shuffling ±₹5,000 around current value.'
    }
    if (isRunning) {
      if (!shuffleEnabled) return 'P&L shuffle paused. Tap profit 7× to edit.'
      if (phase === 'frozen') return 'Today\'s P&L closed at ₹7,20,000.00 after 3:15 PM IST.'
      if (phase === 'decline_frozen') return 'P&L frozen for today after 3:15 PM IST.'
      if (phase === 'profit') return 'Today\'s P&L closed at ₹8,37,000.00 after 3:29 PM IST.'
      return 'P&L closed for today after 3:15 PM IST.'
    }
    return 'Position squared off on 06 Aug. Verified by Dhan.'
  })()

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
            <span>{statusMessage}</span>
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
      </div>

      <section className="dhan-positions">
        <h2 className="dhan-section-title">{sectionTitle}</h2>
        {showPosition ? (
          <div className="dhan-position-card">
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
