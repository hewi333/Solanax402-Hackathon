import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import './App.css'

function App() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(null)

  // Get wallet balance when connected
  const getBalance = async () => {
    if (publicKey) {
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / LAMPORTS_PER_SOL)
    }
  }

  // Fetch balance when wallet connects
  if (connected && publicKey && balance === null) {
    getBalance()
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">💰</div>
            <h1>FinanceAI Coach</h1>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <main className="main-content">
        {!connected ? (
          <div className="welcome-section">
            <h2>Welcome to FinanceAI Coach</h2>
            <p className="tagline">
              Your AI-powered finance coach that rewards good habits with instant crypto
            </p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <h3>AI-Powered Coaching</h3>
                <p>Chat naturally about your financial goals</p>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <h3>Instant Rewards</h3>
                <p>Earn SOL for completing financial habits</p>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <h3>Track Progress</h3>
                <p>See your streaks and achievements grow</p>
              </div>
            </div>
            <div className="cta">
              <p className="cta-text">Connect your Phantom wallet to get started</p>
              <p className="network-badge">🔗 Using Solana Devnet</p>
            </div>
          </div>
        ) : (
          <div className="dashboard">
            <div className="wallet-info">
              <h2>Wallet Connected! 🎉</h2>
              <div className="info-card">
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Balance:</span>
                  <span className="value">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</span>
                </div>
                <button onClick={getBalance} className="refresh-button">
                  🔄 Refresh Balance
                </button>
              </div>
            </div>

            <div className="coming-soon">
              <h3>Chat Interface Coming Soon!</h3>
              <p>We're building the AI chat interface where you'll:</p>
              <ul>
                <li>✅ Chat with your AI finance coach</li>
                <li>✅ Complete financial habit challenges</li>
                <li>✅ Earn instant SOL rewards</li>
                <li>✅ Track your progress and streaks</li>
              </ul>
              <p className="dev-note">
                🚧 Currently in development for Solana x402 Hackathon
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ for Solana x402 Hackathon</p>
        <p className="footer-links">
          <a href="https://solana.com/x402/hackathon" target="_blank" rel="noopener noreferrer">
            About Hackathon
          </a>
          {' • '}
          <a href="https://github.com/heyhewi/Solanax402-Hackathon" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
