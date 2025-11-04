import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js'
import ChatInterface from './components/ChatInterface'
import RewardsModal from './components/RewardsModal'
import './App.css'

function App() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(null)
  const [totalEarned, setTotalEarned] = useState(0)
  const [habitsCompleted, setHabitsCompleted] = useState(0)
  const [currentReward, setCurrentReward] = useState(null)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [rewardHistory, setRewardHistory] = useState([])

  // Get wallet balance when connected
  const getBalance = async () => {
    if (publicKey) {
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / LAMPORTS_PER_SOL)
    }
  }

  // Fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      getBalance()
    }
  }, [connected, publicKey])

  // Handle habit completion and rewards
  const handleHabitCompleted = async (habitResult) => {
    console.log('Habit completed:', habitResult)

    // Update stats
    setHabitsCompleted(prev => prev + 1)
    setTotalEarned(prev => prev + habitResult.reward)

    // Add to history
    const rewardEntry = {
      ...habitResult,
      timestamp: new Date(),
      txSignature: null
    }

    setRewardHistory(prev => [rewardEntry, ...prev])

    // Show reward modal
    setCurrentReward(habitResult)
    setShowRewardModal(true)

    // Simulate reward payment (in production, this would be actual SOL transfer)
    // For demo purposes, we're just showing the UI
    console.log(`Would send ${habitResult.reward} SOL for completing: ${habitResult.habit}`)

    // Note: Uncomment below for actual SOL transfers on devnet
    // await sendReward(habitResult.reward)
  }

  // Function to send actual SOL reward (currently commented out for safety)
  const sendReward = async (amount) => {
    if (!publicKey || !connected) return

    try {
      // This would be the reward sender wallet (in production, this would be a server wallet)
      // For demo, we're just logging the intent
      console.log(`Sending ${amount} SOL reward to ${publicKey.toBase58()}`)

      /* Actual implementation would look like:
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: rewardWalletPublicKey,
          toPubkey: publicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')
      */

      // Refresh balance after reward
      setTimeout(() => {
        getBalance()
      }, 1000)
    } catch (error) {
      console.error('Error sending reward:', error)
    }
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

            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <div className="stat-value">{habitsCompleted}</div>
                  <div className="stat-label">Habits Completed</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-value">{totalEarned.toFixed(3)} SOL</div>
                  <div className="stat-label">Total Earned</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <div className="stat-value">{habitsCompleted > 0 ? '1' : '0'} day</div>
                  <div className="stat-label">Current Streak</div>
                </div>
              </div>
            </div>

            <ChatInterface onHabitCompleted={handleHabitCompleted} />
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

      <RewardsModal
        isOpen={showRewardModal}
        reward={currentReward}
        onClose={() => setShowRewardModal(false)}
      />
    </div>
  )
}

export default App
