import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js'
import ChatInterface from './components/ChatInterface'
import RewardsModal from './components/RewardsModal'
import EmbeddedWalletButton from './components/EmbeddedWalletButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Wallet, Sparkles, TrendingUp, Target, Lock, Droplet, RefreshCw, GraduationCap, Bot, Zap, BarChart3, Trophy, Coins, Info } from 'lucide-react'

function App() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(null)
  const [totalEarned, setTotalEarned] = useState(0)
  const [modulesCompleted, setModulesCompleted] = useState(0)
  const [currentReward, setCurrentReward] = useState(null)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [rewardHistory, setRewardHistory] = useState([])
  const [hasPaid, setHasPaid] = useState(false)
  const [isRequestingFaucet, setIsRequestingFaucet] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)

  // Embedded wallet state
  const [embeddedWallet, setEmbeddedWallet] = useState(null)
  const [isEmbeddedWallet, setIsEmbeddedWallet] = useState(false)

  // Wallet selection state - ensures only one wallet type is active at a time
  const [activeWalletType, setActiveWalletType] = useState(null) // 'external' | 'embedded' | null

  const TREASURY_WALLET = import.meta.env.VITE_TREASURY_WALLET || 'YOUR_TREASURY_WALLET_ADDRESS'
  const PAYMENT_AMOUNT = 0.05  // Reduced for testing - allows more iterations with treasury funds
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  // Check if any wallet is connected (browser or embedded)
  const isWalletConnected = connected || isEmbeddedWallet
  const currentWalletAddress = publicKey?.toBase58() || embeddedWallet?.address

  const getBalance = async () => {
    if (publicKey) {
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / LAMPORTS_PER_SOL)
    } else if (embeddedWallet?.address) {
      // Get balance for embedded wallet
      const publicKey = new PublicKey(embeddedWallet.address)
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / LAMPORTS_PER_SOL)
    }
  }

  // Check for existing embedded wallet on mount
  useEffect(() => {
    const cdpUserId = localStorage.getItem('cdp_user_id')
    const cdpAddress = localStorage.getItem('cdp_wallet_address')
    if (cdpUserId && cdpAddress) {
      setEmbeddedWallet({ userId: cdpUserId, address: cdpAddress })
      setIsEmbeddedWallet(true)
    }
  }, [])

  // Auto-connect priority: External wallet (Phantom) > Embedded wallet
  // External wallets take priority because users with wallets likely prefer them
  useEffect(() => {
    if (connected && publicKey && !activeWalletType) {
      console.log('External wallet auto-connected (Phantom/Coinbase extension)')
      setActiveWalletType('external')
      setIsEmbeddedWallet(false)  // Disable embedded if external connects
    } else if (!connected && activeWalletType === 'external') {
      // External wallet disconnected - reset
      console.log('External wallet disconnected')
      setActiveWalletType(null)
    }
  }, [connected, publicKey, activeWalletType])

  useEffect(() => {
    // Only activate embedded wallet if no external wallet is connected
    if (isEmbeddedWallet && embeddedWallet && !connected && !activeWalletType) {
      console.log('Embedded wallet auto-loaded from localStorage')
      setActiveWalletType('embedded')
    }
  }, [isEmbeddedWallet, embeddedWallet, connected, activeWalletType])

  useEffect(() => {
    if (connected && publicKey) {
      getBalance()
    } else if (embeddedWallet) {
      getBalance()
    }
  }, [connected, publicKey, embeddedWallet])

  // Disconnect function - clears active wallet
  const handleDisconnectWallet = () => {
    if (activeWalletType === 'embedded') {
      // Clear embedded wallet
      localStorage.removeItem('cdp_user_id')
      localStorage.removeItem('cdp_wallet_address')
      setEmbeddedWallet(null)
      setIsEmbeddedWallet(false)
    }
    // External wallet disconnect is handled by wallet adapter's disconnect button
    setActiveWalletType(null)
    setBalance(null)
    console.log('Wallet disconnected - ready for new selection')
  }

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

  const processPayment = async () => {
    if (!publicKey || !connected) return

    setIsPaymentProcessing(true)
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TREASURY_WALLET),
          lamports: Math.floor(PAYMENT_AMOUNT * LAMPORTS_PER_SOL),  // Math.floor ensures integer for BigInt conversion
        })
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')

      console.log('Payment successful:', signature)
      setHasPaid(true)
      getBalance()

      alert(`Payment successful!\n\nYou paid ${PAYMENT_AMOUNT} SOL to unlock the Solana x402 learning platform.\nComplete 5 learning modules to earn it back!\n\nTransaction: ${signature}`)

    } catch (error) {
      console.error('Payment error:', error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const processEmbeddedPayment = async () => {
    if (!embeddedWallet) return

    setIsPaymentProcessing(true)
    try {
      const response = await fetch(`${API_URL}/api/cdp/send-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: embeddedWallet.userId,
          amount: PAYMENT_AMOUNT,
          recipientAddress: TREASURY_WALLET
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.hint || 'Payment failed')
      }

      if (data.success) {
        console.log('Embedded wallet payment successful:', data.signature)
        setHasPaid(true)
        getBalance()

        alert(`Payment successful!\n\nYou paid ${PAYMENT_AMOUNT} SOL to unlock the Solana x402 learning platform.\nComplete 5 learning modules to earn it back!\n\nTransaction: ${data.signature}`)
      }
    } catch (error) {
      console.error('Embedded payment error:', error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const handleSessionComplete = () => {
    setHasPaid(false)
    setModulesCompleted(0)
    setTotalEarned(0)
    setRewardHistory([])
    setCurrentReward(null)
    setShowRewardModal(false)
    setSessionKey(prev => prev + 1)
    getBalance()
    console.log('Session complete - ready for new session')
  }

  const handleModuleCompleted = async (moduleResult) => {
    console.log('Module completed:', moduleResult)
    setModulesCompleted(prev => prev + 1)
    setTotalEarned(prev => prev + moduleResult.reward)

    const rewardEntry = {
      ...moduleResult,
      timestamp: new Date(),
      txSignature: null
    }

    setRewardHistory(prev => [rewardEntry, ...prev])
    setCurrentReward(moduleResult)
    setShowRewardModal(true)
    console.log(`Would send ${moduleResult.reward} SOL for completing: ${moduleResult.module}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Educational Project Banner */}
      <div className="bg-solana-purple/10 border-b border-solana-purple/20">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Info className="w-4 h-4 text-solana-purple" />
            <span className="text-muted-foreground">
              <strong className="text-solana-purple">Educational Project</strong> - Solana x402 Hackathon submission using Devnet (test network)
              <a
                href="https://github.com/heyhewi/Solanax402-Hackathon"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-solana-green hover:underline"
              >
                View Source Code
              </a>
            </span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                Solana x402 Learn & Earn
              </h1>
            </div>

            {/* Wallet Connection Options - Only show relevant option based on state */}
            <div className="flex items-center gap-3">
              {/* Show external wallet button if no wallet is connected OR external wallet is active */}
              {(!activeWalletType || activeWalletType === 'external') && (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-900/20 border border-purple-500/30">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="64" cy="64" r="64" fill="#AB9FF2"/>
                        <path d="M85.5 45.5C85.5 38.5964 79.9036 33 72.9999 33H47.5001C42.5295 33 38.5 37.0294 38.5 42.0001V86C38.5 90.9706 42.5295 95 47.5001 95H80.4999C85.4705 95 89.5 90.9706 89.5 86V59C89.5 51.5442 83.4558 45.5 76 45.5H85.5Z" fill="white"/>
                        <circle cx="76" cy="54" r="4" fill="#AB9FF2"/>
                        <circle cx="64" cy="54" r="4" fill="#AB9FF2"/>
                      </svg>
                    </div>
                    <WalletMultiButton style={{ background: 'transparent', border: 'none', padding: 0 }} />
                  </div>
                  <span className="text-xs text-muted-foreground">👻 Phantom & More</span>
                </div>
              )}

              {/* Show divider only when both options are visible */}
              {!activeWalletType && (
                <div className="h-12 w-px bg-border" />
              )}

              {/* Show embedded wallet button if no wallet is connected OR embedded wallet is active */}
              {(!activeWalletType || activeWalletType === 'embedded') && (
                <div className="flex flex-col items-start gap-1">
                  <EmbeddedWalletButton onWalletCreated={(wallet) => {
                    console.log('CDP Wallet created:', wallet)
                    const userId = localStorage.getItem('cdp_user_id')
                    if (userId && wallet.address) {
                      setEmbeddedWallet({ userId, address: wallet.address })
                      setIsEmbeddedWallet(true)
                      setActiveWalletType('embedded')  // Set active wallet type
                      getBalance()
                    }
                  }} />
                  <span className="text-xs text-muted-foreground">🏦 Coinbase CDP</span>
                </div>
              )}

              {/* Show disconnect/switch button when wallet is connected */}
              {activeWalletType && (
                <Button
                  onClick={handleDisconnectWallet}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  Switch Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {!isWalletConnected ? (
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                  Solana x402 Learn & Earn
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Learn about Solana x402 AI agents and earn SOL as you progress through interactive modules
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="border-2 hover:border-solana-purple transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-solana-purple/10 flex items-center justify-center mx-auto mb-2">
                    <Bot className="w-6 h-6 text-solana-purple" />
                  </div>
                  <CardTitle>AI-Powered Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Learn about Solana x402 AI agents through interactive lessons</CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-solana-green transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-solana-green/10 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-solana-green" />
                  </div>
                  <CardTitle>Earn While Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Earn SOL rewards for completing each learning module</CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-solana-purple transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-solana-purple/10 flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-6 h-6 text-solana-purple" />
                  </div>
                  <CardTitle>Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Monitor your learning journey and earnings in real-time</CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 space-y-4">
              <p className="text-lg text-muted-foreground">Connect your wallet to get started</p>
              <div className="flex flex-col items-center gap-2">
                <Badge variant="solana" className="text-base px-4 py-2">
                  Using Solana Devnet
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Choose Browser Wallets (Phantom, Coinbase) or create an Embedded Wallet
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Wallet Connected!
                  {activeWalletType === 'embedded' && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      🏦 Coinbase CDP
                    </Badge>
                  )}
                  {activeWalletType === 'external' && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      👻 External Wallet
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Address:</span>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {currentWalletAddress?.slice(0, 4)}...{currentWalletAddress?.slice(-4)}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Balance:</span>
                      <span className="text-sm font-semibold">
                        {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={getBalance} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Balance
                    </Button>
                    {balance !== null && balance < PAYMENT_AMOUNT && !hasPaid && (
                      <Button
                        onClick={requestFaucet}
                        variant="secondary"
                        size="sm"
                        disabled={isRequestingFaucet}
                      >
                        <Droplet className="w-4 h-4 mr-2" />
                        {isRequestingFaucet ? 'Requesting...' : 'Get Test SOL'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {!hasPaid ? (
              <Card className="border-2 border-solana-purple/50">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-solana-purple/10 flex items-center justify-center text-4xl mx-auto mb-4">
                    <Lock className="w-8 h-8 text-solana-purple" />
                  </div>
                  <CardTitle className="text-3xl">Unlock Learning Platform</CardTitle>
                  <CardDescription className="text-base">
                    Pay <strong className="text-solana-green">{PAYMENT_AMOUNT} SOL</strong> to access the Solana x402 learning modules.
                    Complete all 5 modules to earn your payment back!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <Sparkles className="w-6 h-6 text-solana-purple" />
                      <span className="text-sm">Learn 5 Solana x402 concepts</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <TrendingUp className="w-6 h-6 text-solana-green" />
                      <span className="text-sm">Earn 0.01 SOL per module</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <Target className="w-6 h-6 text-solana-purple" />
                      <span className="text-sm">Get your {PAYMENT_AMOUNT} SOL back!</span>
                    </div>
                  </div>

                  {balance !== null && balance < PAYMENT_AMOUNT ? (
                    <div className="text-center space-y-4 p-6 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-destructive font-semibold">
                        Insufficient balance. You need {PAYMENT_AMOUNT} SOL to start.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your balance: {balance.toFixed(4)} SOL
                      </p>
                      <Button
                        onClick={requestFaucet}
                        variant="secondary"
                        size="lg"
                        disabled={isRequestingFaucet}
                        className="w-full md:w-auto"
                      >
                        <Droplet className="w-4 h-4 mr-2" />
                        {isRequestingFaucet ? 'Requesting...' : 'Get 1 SOL from Faucet'}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={isEmbeddedWallet ? processEmbeddedPayment : processPayment}
                      variant="solana"
                      size="lg"
                      disabled={isPaymentProcessing || balance === null}
                      className="w-full"
                    >
                      {isPaymentProcessing ? 'Processing Payment...' : `Pay ${PAYMENT_AMOUNT} SOL to Start`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">Modules Completed</CardTitle>
                        <div className="w-10 h-10 rounded-full bg-solana-purple/10 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-solana-purple" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-solana-purple">
                        {modulesCompleted}/5
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">Earned Back</CardTitle>
                        <div className="w-10 h-10 rounded-full bg-solana-green/10 flex items-center justify-center">
                          <Coins className="w-5 h-5 text-solana-green" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-solana-green">
                        {totalEarned.toFixed(2)} SOL
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">Remaining to Earn</CardTitle>
                        <div className="w-10 h-10 rounded-full bg-solana-purple/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-solana-purple" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-solana-purple">
                        {(PAYMENT_AMOUNT - totalEarned).toFixed(2)} SOL
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <ChatInterface
                  key={sessionKey}
                  onModuleCompleted={handleModuleCompleted}
                  onSessionComplete={handleSessionComplete}
                />
              </>
            )}
          </div>
        )}
      </main>

      <footer className="border-t bg-card py-6 mt-12">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Built for Solana x402 Hackathon
          </p>
          <p className="text-sm text-muted-foreground space-x-2">
            <a
              href="https://solana.com/x402/hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-solana-purple transition-colors"
            >
              About Hackathon
            </a>
            <span>•</span>
            <a
              href="https://github.com/heyhewi/Solanax402-Hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-solana-green transition-colors"
            >
              GitHub
            </a>
          </p>
        </div>
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
