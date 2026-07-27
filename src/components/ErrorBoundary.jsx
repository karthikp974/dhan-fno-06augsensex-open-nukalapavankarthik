import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: 'Inter, sans-serif',
            background: '#f0f0f0',
          }}
        >
          <div
            style={{
              maxWidth: 420,
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}
          >
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              Refresh the page. If this keeps happening, clear site data and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: '#24946f',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
