// src/components/PositionsPage75500.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./DhanPositionsReplica.css";

const INITIAL_PNL = 124398.38;
const LIVE_RANGE = 5000;

function formatINR(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  return (
    sign +
    abs.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function isMarketOpen() {
  const now = new Date();

  const day = now.getDay();
  if (day === 0 || day === 6) return false;

  const minutes = now.getHours() * 60 + now.getMinutes();

  return minutes >= 9 * 60 + 15 && minutes < 15 * 60 + 30;
}

export default function PositionsPage75500() {
  const [basePnl, setBasePnl] = useState(INITIAL_PNL);
  const [livePnl, setLivePnl] = useState(INITIAL_PNL);

  const [marketOpen, setMarketOpen] = useState(isMarketOpen());

  const animationRef = useRef(null);

  // Hidden 7-tap editor
  const [tapCount, setTapCount] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const tapTimer = useRef(null);

  const marketStatus = useMemo(() => {
    return marketOpen
      ? {
          text: "Market Open",
          color: "#16c784",
        }
      : {
          text: "Market Closed",
          color: "#ff5b5b",
        };
  }, [marketOpen]);

  useEffect(() => {
    const clock = setInterval(() => {
      setMarketOpen(isMarketOpen());
    }, 30000);

    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    let value = basePnl;

    animationRef.current = setInterval(() => {
      value += (Math.random() - 0.5) * 900;

      const upper = basePnl + LIVE_RANGE;
      const lower = basePnl - LIVE_RANGE;

      if (value > upper) value = upper;
      if (value < lower) value = lower;

      setLivePnl(Number(value.toFixed(2)));
    }, 1200);

    return () => clearInterval(animationRef.current);
  }, [basePnl]);

  const handleHiddenTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);

    const next = tapCount + 1;
    setTapCount(next);

    if (next >= 7) {
      setTapCount(0);
      setEditorOpen(true);
      return;
    }

    tapTimer.current = setTimeout(() => {
      setTapCount(0);
    }, 1800);
  };

  return (
    <div className="dhan-page">
    <div className="dhan-header">
      <div className="dhan-header-left">
        <button className="dhan-back-btn">←</button>

        <div>
          <h2 className="dhan-title">Positions</h2>

          <div
            className="dhan-market-status"
            style={{ color: marketStatus.color }}
          >
            ● {marketStatus.text}
          </div>
        </div>
      </div>

      <div className="dhan-header-right">
        <button className="dhan-icon-btn">⌕</button>
        <button className="dhan-icon-btn">⋮</button>
      </div>
    </div>

    <div className="dhan-content">

      <div className="dhan-pnl-card">
        <div className="dhan-pnl-label">Total P&amp;L</div>

        <div
          className={`dhan-total-pnl ${
            livePnl >= 0 ? "profit" : "loss"
          }`}
          onClick={handleHiddenTap}
        >
          ₹{formatINR(livePnl)}
        </div>

        <div className="dhan-day-change">
          Live Position
        </div>
      </div>

      <div className="dhan-position-card">

        <div className="dhan-position-top">

          <div className="dhan-position-name">
            <div className="dhan-symbol">
              SENSEX
            </div>

            <div className="dhan-contract">
              06 Aug 75500 CALL
            </div>
          </div>

          <div
            className={`dhan-position-pnl ${
              livePnl >= 0 ? "profit" : "loss"
            }`}
          >
            ₹{formatINR(livePnl)}
          </div>

        </div>

        <div className="dhan-position-divider" />

        <div className="dhan-position-details">

          <div className="dhan-detail-item">
            <span>Qty</span>
            <strong>100</strong>
          </div>

          <div className="dhan-detail-item">
            <span>Avg</span>
            <strong>₹225.35</strong>
          </div>

          <div className="dhan-detail-item">
            <span>LTP</span>
            <strong>
              ₹{(225.35 + (livePnl - basePnl) / 100).toFixed(2)}
            </strong>
          </div>

          <div className="dhan-detail-item">
            <span>Product</span>
            <strong>NRML</strong>
          </div>

        </div>
        <div className="dhan-position-footer">
            <div className="dhan-footer-item">
              <span>Day P&amp;L</span>
              <strong
                className={
                  livePnl >= 0 ? "profit" : "loss"
                }
              >
                ₹{formatINR(livePnl)}
              </strong>
            </div>

            <div className="dhan-footer-item">
              <span>Net P&amp;L</span>
              <strong
                className={
                  livePnl >= 0 ? "profit" : "loss"
                }
              >
                ₹{formatINR(livePnl)}
              </strong>
            </div>
          </div>

        </div>

        {editorOpen && (
          <div className="dhan-editor-overlay">
            <div className="dhan-editor-card">

              <h3>Edit Position</h3>

              <label>Base P&amp;L</label>

              <input
                type="number"
                step="0.01"
                value={basePnl}
                onChange={(e) =>
                  setBasePnl(Number(e.target.value))
                }
              />

              <div className="dhan-editor-actions">
                <button
                  onClick={() => setEditorOpen(false)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
              </div>

<div className="dhan-bottom-bar">
  <button className="dhan-bottom-btn">
    Add
  </button>

  <button className="dhan-bottom-btn">
    Exit
  </button>

  <button className="dhan-bottom-btn">
    Convert
  </button>

  <button className="dhan-bottom-btn">
    Analytics
  </button>
</div>
</div>
);
}