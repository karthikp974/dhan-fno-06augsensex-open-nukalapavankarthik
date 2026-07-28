import { useState } from 'react'
import './PnlEditorPanel.css'

export default function PnlEditorPanel({ currentPnl, shuffleEnabled, onApply, onClose }) {
  const [value, setValue] = useState(String(Math.round(currentPnl)))
  const [shuffle, setShuffle] = useState(shuffleEnabled)

  const handleApply = () => {
    const parsed = Number(value.replace(/,/g, ''))
    if (Number.isNaN(parsed)) return
    onApply({ customValue: parsed, shuffleEnabled: shuffle })
    onClose()
  }

  return (
    <div className="pnl-editor-backdrop" onClick={onClose}>
      <div className="pnl-editor-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="pnl-editor-title">Edit P&L</h3>
        <label className="pnl-editor-label">
          Value (₹)
          <input
            className="pnl-editor-input"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <label className="pnl-editor-toggle">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
          />
          Shuffle on (±₹5,000 every few seconds)
        </label>
        <div className="pnl-editor-actions">
          <button type="button" className="pnl-editor-btn pnl-editor-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="pnl-editor-btn pnl-editor-save" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
