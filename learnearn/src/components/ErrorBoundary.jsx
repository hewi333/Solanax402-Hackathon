import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error details
    this.setState({
      error,
      errorInfo
    })

    // TODO: Send error to monitoring service (Sentry, LogRocket, etc.)
    // reportErrorToService(error, errorInfo)
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })

    // Reload the page to fully reset app state
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#0a0f1e',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
            backgroundColor: '#1a1f35',
            borderRadius: '12px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h1 style={{
              fontSize: '24px',
              marginBottom: '16px',
              color: '#ef4444'
            }}>
              ⚠️ Something went wrong
            </h1>

            <p style={{
              fontSize: '16px',
              marginBottom: '24px',
              color: '#94a3b8',
              lineHeight: '1.5'
            }}>
              The application encountered an unexpected error. This might be due to:
            </p>

            <ul style={{
              textAlign: 'left',
              marginBottom: '24px',
              color: '#cbd5e1',
              lineHeight: '1.8'
            }}>
              <li>Wallet connection issues</li>
              <li>Network connectivity problems</li>
              <li>Browser extension conflicts</li>
              <li>Temporary application glitch</li>
            </ul>

            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Reload Application
            </button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '24px',
                textAlign: 'left',
                backgroundColor: '#0f172a',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  color: '#f59e0b',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#ef4444',
                  marginTop: '8px',
                  fontSize: '11px',
                  lineHeight: '1.4'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    // No error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary
