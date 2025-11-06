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

  const TREASURY_WALLET = import.meta.env.VITE_TREASURY_WALLET || 'YOUR_TREASURY_WALLET_ADDRESS'
  const PAYMENT_AMOUNT = 0.5

  const getBalance = async () => {
    if (publicKey) {
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / LAMPORTS_PER_SOL)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      getBalance()
    }
  }, [connected, publicKey])

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
          lamports: PAYMENT_AMOUNT * LAMPORTS_PER_SOL,
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

            {/* Wallet Connection Options */}
            <div className="flex items-center gap-3">
              {/* Browser Wallets (Phantom, Coinbase extension) */}
              <div className="flex flex-col items-end gap-1">
                <WalletMultiButton />
                <span className="text-xs text-muted-foreground">Browser Wallets</span>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-border" />

              {/* Embedded Wallet (CDP) */}
              <div className="flex flex-col items-start gap-1">
                <EmbeddedWalletButton onWalletCreated={(wallet) => {
                  console.log('CDP Wallet created:', wallet)
                }} />
                <span className="text-xs text-muted-foreground">Embedded Wallet</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {!connected ? (
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Address:</span>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
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
                      <span className="text-sm">Earn 0.1 SOL per module</span>
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
                      onClick={processPayment}
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
