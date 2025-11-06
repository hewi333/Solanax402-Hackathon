import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js'
import ChatInterface from './components/ChatInterface'
import RewardsModal from './components/RewardsModal'
import './App.css'
import './App-payment.css'

function App() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(null)
  const [totalEarned, setTotalEarned] = useState(0)
  const [habitsCompleted, setHabitsCompleted] = useState(0)
  const [currentReward, setCurrentReward] = useState(null)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [rewardHistory, setRewardHistory] = useState([])
  const [hasPaid, setHasPaid] = useState(false)
  const [isRequestingFaucet, setIsRequestingFaucet] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [sessionKey, setSessionKey] = useState(0) // Used to remount ChatInterface on new session

  // Treasury wallet address (you'll need to set this)
  const TREASURY_WALLET = import.meta.env.VITE_TREASURY_WALLET || 'YOUR_TREASURY_WALLET_ADDRESS'
  const PAYMENT_AMOUNT = 0.5 // SOL

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

  // Request faucet funds
  const requestFaucet = async () => {
    if (!publicKey) return

    setIsRequestingFaucet(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/faucet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request faucet')
      }

      alert(`Success! ${data.amount} SOL airdropped to your wallet!\n\nTransaction: ${data.signature}`)

      // Refresh balance after airdrop
      setTimeout(() => {
        getBalance()
      }, 2000)

    } catch (error) {
      console.error('Faucet error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsRequestingFaucet(false)
    }
  }

  // Process payment to unlock AI coach
  const processPayment = async () => {
    if (!publicKey || !connected) return

    setIsPaymentProcessing(true)
    try {
      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TREASURY_WALLET),
          lamports: PAYMENT_AMOUNT * LAMPORTS_PER_SOL,
        })
      )

      // Send transaction
      const signature = await sendTransaction(transaction, connection)

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed')

      console.log('Payment successful:', signature)
      setHasPaid(true)

      // Refresh balance
      getBalance()

      alert(`Payment successful! 🎉\n\nYou paid ${PAYMENT_AMOUNT} SOL to unlock the AI Coach.\nComplete 5 learning modules to earn it back!\n\nTransaction: ${signature}`)

    } catch (error) {
      console.error('Payment error:', error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  // Handle session completion (user earned back deposit)
  const handleSessionComplete = () => {
    // Reset all state to require new payment
    setHasPaid(false)
    setHabitsCompleted(0)
    setTotalEarned(0)
    setRewardHistory([])
    setCurrentReward(null)
    setShowRewardModal(false)
    setSessionKey(prev => prev + 1) // Increment to remount ChatInterface

    // Refresh balance to show updated amount
    getBalance()

    console.log('Session complete - ready for new session')
  }

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
                <div className="button-group">
                  <button onClick={getBalance} className="refresh-button">
                    🔄 Refresh Balance
                  </button>
                  {balance !== null && balance < PAYMENT_AMOUNT && !hasPaid && (
                    <button
                      onClick={requestFaucet}
                      className="faucet-button"
                      disabled={isRequestingFaucet}
                    >
                      {isRequestingFaucet ? '⏳ Requesting...' : '🚰 Get Test SOL'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!hasPaid ? (
              <div className="payment-gate">
                <div className="gate-icon">🔒</div>
                <h2>Unlock AI Financial Coach</h2>
                <p className="gate-description">
                  Pay <strong>{PAYMENT_AMOUNT} SOL</strong> to access personalized financial coaching.
                  Complete 5 learning modules to earn your payment back!
                </p>

                <div className="payment-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-icon">💡</span>
                    <span>Learn 5 financial concepts</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-icon">💰</span>
                    <span>Earn 0.1 SOL per module</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-icon">✨</span>
                    <span>Get your {PAYMENT_AMOUNT} SOL back!</span>
                  </div>
                </div>

                {balance !== null && balance < PAYMENT_AMOUNT ? (
                  <div className="insufficient-funds">
                    <p>⚠️ Insufficient balance. You need {PAYMENT_AMOUNT} SOL to start.</p>
                    <p>Your balance: {balance.toFixed(4)} SOL</p>
                    <button
                      onClick={requestFaucet}
                      className="faucet-button-large"
                      disabled={isRequestingFaucet}
                    >
                      {isRequestingFaucet ? '⏳ Requesting...' : '🚰 Get 1 SOL from Faucet'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={processPayment}
                    className="payment-button"
                    disabled={isPaymentProcessing || balance === null}
                  >
                    {isPaymentProcessing ? '⏳ Processing Payment...' : `💳 Pay ${PAYMENT_AMOUNT} SOL to Start`}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                      <div className="stat-value">{habitsCompleted}/5</div>
                      <div className="stat-label">Modules Completed</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <div className="stat-value">{totalEarned.toFixed(2)} SOL</div>
                      <div className="stat-label">Earned Back</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-value">{(PAYMENT_AMOUNT - totalEarned).toFixed(2)} SOL</div>
                      <div className="stat-label">Remaining to Earn</div>
                    </div>
                  </div>
                </div>

                <ChatInterface
                  key={sessionKey}
                  onHabitCompleted={handleHabitCompleted}
                  onSessionComplete={handleSessionComplete}
                />
              </>
            )}
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
