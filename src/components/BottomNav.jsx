export default function BottomNav() {
  return (
    <nav className="dhan-bottom-nav">
      <div className="dhan-bottom-nav-inner">
        <button className="dhan-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-4.5v-5.5h-3V20H5a1 1 0 01-1-1v-8.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span>Home</span>
        </button>
        <button className="dhan-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M7 3h10a1 1 0 011 1v16l-6-3.5L6 20V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span>Watchlist</span>
        </button>
        <div className="dhan-nav-center-slot" aria-hidden="true" />
        <button className="dhan-nav-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="16" height="2.5" rx="1" fill="currentColor" />
            <rect x="4" y="10.75" width="16" height="2.5" rx="1" fill="currentColor" />
            <rect x="4" y="16.5" width="16" height="2.5" rx="1" fill="currentColor" />
          </svg>
          <span>Orders</span>
        </button>
        <button className="dhan-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M8 9V7.5A4 4 0 0112 3.5a4 4 0 014 4V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M6 9h12v2.5c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8V9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <text x="12" y="15" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="700" fontFamily="Inter, sans-serif">₹</text>
          </svg>
          <span>Money</span>
        </button>
      </div>

      <button className="dhan-nav-center" aria-label="Portfolio">
        <div className="dhan-nav-logo">
          <span className="dhan-nav-dha">ध</span>
        </div>
      </button>
    </nav>
  )
}
