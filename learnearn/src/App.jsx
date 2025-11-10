import { useState, useEffect, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js'
import ChatInterface from './components/ChatInterface'
import RewardsModal from './components/RewardsModal'
import EmbeddedWalletButton from './components/EmbeddedWalletButton'
import TechBanner from './components/TechBanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Wallet, Sparkles, TrendingUp, Target, Lock, Droplet, RefreshCw, GraduationCap, Bot, Zap, BarChart3, Trophy, Coins, Info, Play, ChevronRight } from 'lucide-react'

function App() {
  const { publicKey, connected, sendTransaction, wallet, disconnect } = useWallet()
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
  const [x402Status, setX402Status] = useState(null) // Track x402 Payment Required status
  const [hasClickedStart, setHasClickedStart] = useState(false) // Track if user clicked "Start Learning"

  // Embedded wallet state
  const [embeddedWallet, setEmbeddedWallet] = useState(null)
  const [isEmbeddedWallet, setIsEmbeddedWallet] = useState(false)

  // Wallet selection state - ensures only one wallet type is active at a time
  const [activeWalletType, setActiveWalletType] = useState(null) // 'external' | 'embedded' | null

  // Wallet switching guard to prevent race conditions
  const [isSwitchingWallet, setIsSwitchingWallet] = useState(false)

  // Wallet connection state machine for better UX
  const [walletConnectionState, setWalletConnectionState] = useState('disconnected')
  // States: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

  // Error state for user-facing errors
  const [walletError, setWalletError] = useState(null)

  const TREASURY_WALLET = import.meta.env.VITE_TREASURY_WALLET || 'YOUR_TREASURY_WALLET_ADDRESS'
  const PAYMENT_AMOUNT = 0.033  // 3 modules x 0.011 SOL each = earn back full amount
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  // Single source of truth for wallet connection and address
  // Use activeWalletType as the primary indicator with defensive fallback
  const isWalletConnected = activeWalletType !== null
  const currentWalletAddress = (() => {
    // Primary: Use activeWalletType to determine address
    if (activeWalletType === 'external') {
      return publicKey?.toBase58()
    }
    if (activeWalletType === 'embedded') {
      return embeddedWallet?.address
    }

    // DEFENSIVE FALLBACK: If activeWalletType not set yet but we have wallet data
    // This handles edge cases during state initialization
    if (embeddedWallet?.address && !connected) {
      console.log('⚠️ Using embedded wallet address despite activeWalletType not set (initialization race condition)')
      return embeddedWallet.address
    }
    if (publicKey && connected) {
      console.log('⚠️ Using external wallet despite activeWalletType not set (initialization race condition)')
      return publicKey.toBase58()
    }

    return null
  })()

  // Get specific wallet name for display
  const getWalletDisplayName = () => {
    if (activeWalletType === 'embedded') {
      return 'Coinbase CDP Wallet'
    } else if (activeWalletType === 'external' && wallet?.adapter?.name) {
      const walletName = wallet.adapter.name
      // Return wallet name without emoji for cleaner look
      if (walletName.toLowerCase().includes('phantom')) {
        return 'Phantom'
      } else if (walletName.toLowerCase().includes('coinbase')) {
        return 'Coinbase Wallet'
      } else if (walletName.toLowerCase().includes('solflare')) {
        return 'Solflare'
      } else {
        return walletName
      }
    } else if (activeWalletType === 'external') {
      return 'Wallet Connected'
    }
    return null
  }

  // Auto-refreshing balance function with useCallback
  const getBalance = useCallback(async () => {
    try {
      if (publicKey) {
        const bal = await connection.getBalance(publicKey)
        setBalance(bal / LAMPORTS_PER_SOL)
        console.log('💰 Balance refreshed (external wallet):', bal / LAMPORTS_PER_SOL)
      } else if (embeddedWallet?.address) {
        // Get balance for embedded wallet
        const embeddedPublicKey = new PublicKey(embeddedWallet.address)
        const bal = await connection.getBalance(embeddedPublicKey)
        setBalance(bal / LAMPORTS_PER_SOL)
        console.log('💰 Balance refreshed (embedded wallet):', bal / LAMPORTS_PER_SOL)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
      setWalletError({
        message: 'Failed to fetch wallet balance',
        technical: error.message
      })
    }
  }, [publicKey, embeddedWallet, connection])

  // X402 Protocol: Verify access and get 402 status if payment required
  const verifyX402Access = async () => {
    try {
      const response = await fetch(`${API_URL}/api/x402/verify-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: currentWalletAddress,
          hasPaid: hasPaid
        })
      })

      const data = await response.json()

      if (response.status === 402) {
        // HTTP 402 Payment Required
        setX402Status({
          statusCode: 402,
          message: data.message,
          paymentDetails: data.paymentDetails,
          headers: {
            'X-Payment-Required': response.headers.get('X-Payment-Required'),
            'X-Payment-Amount': response.headers.get('X-Payment-Amount'),
            'X-Payment-Network': response.headers.get('X-Payment-Network')
          }
        })
        console.log('🔒 HTTP 402: Payment Required', data)
      } else if (response.status === 200) {
        // Access granted
        setX402Status(null)
        console.log('✅ HTTP 200: Access Granted')
      }
    } catch (error) {
      console.error('X402 verification error:', error)
    }
  }

  // Load embedded wallet from localStorage on mount with validation and session recovery
  useEffect(() => {
    const cdpUserId = localStorage.getItem('cdp_user_id')
    const cdpAddress = localStorage.getItem('cdp_wallet_address')
    const sessionWalletType = sessionStorage.getItem('active_wallet_type')

    console.log('🔄 Initial wallet loading from localStorage:', {
      hasCdpUserId: !!cdpUserId,
      hasCdpAddress: !!cdpAddress,
      sessionWalletType,
      timestamp: new Date().toISOString()
    })

    // Validate that both values exist and address looks valid
    if (cdpUserId && cdpAddress) {
      try {
        setWalletConnectionState('reconnecting')
        // Validate address format
        new PublicKey(cdpAddress)

        console.log('✅ CDP wallet validated, setting state synchronously')

        // CRITICAL FIX: Set all wallet state synchronously in batch to avoid race conditions
        // This ensures activeWalletType is set at the same time as embeddedWallet
        setEmbeddedWallet({ userId: cdpUserId, address: cdpAddress })
        setIsEmbeddedWallet(true)

        // CRITICAL FIX: Set activeWalletType immediately if this was the active wallet
        // This prevents race conditions where wallet is loaded but not "connected"
        if (sessionWalletType === 'embedded') {
          setActiveWalletType('embedded')
          setWalletConnectionState('connected')
          console.log('✅ CDP wallet restored and set as active immediately')
        } else {
          setWalletConnectionState('disconnected')
          console.log('ℹ️ CDP wallet loaded but not set as active (user previously disconnected)')
        }

      } catch (error) {
        console.error('❌ Invalid embedded wallet address in localStorage:', error)
        setWalletConnectionState('error')
        setWalletError({
          message: 'Failed to restore wallet session',
          technical: error.message
        })
        // Clear invalid data
        localStorage.removeItem('cdp_user_id')
        localStorage.removeItem('cdp_wallet_address')
        sessionStorage.removeItem('active_wallet_type')
      }
    } else {
      console.log('ℹ️ No CDP wallet found in localStorage')
    }
  }, [])

  // Unified wallet detection with priority: External > Embedded
  // This single effect prevents race conditions between wallet types
  useEffect(() => {
    // Prevent wallet detection while switching to avoid race conditions
    if (isSwitchingWallet) {
      console.log('⏸️ Wallet detection paused (switching in progress)')
      return
    }

    console.log('🔍 Wallet detection check:', {
      connected,
      hasPublicKey: !!publicKey,
      isEmbeddedWallet,
      hasEmbeddedWallet: !!embeddedWallet,
      activeWalletType,
      currentAddress: currentWalletAddress
    })

    // Priority 1: External wallet (Phantom/Coinbase) - user clicked WalletMultiButton
    if (connected && publicKey) {
      if (activeWalletType !== 'external') {
        console.log('🔗 Setting external wallet as active')
        setWalletConnectionState('connected')
        setActiveWalletType('external')
        setIsEmbeddedWallet(false) // Disable embedded when external connects
        setWalletError(null) // Clear any errors
        // Persist to session storage
        sessionStorage.setItem('active_wallet_type', 'external')
        console.log('✅ External wallet connected:', publicKey.toBase58())
      }
    }
    // Priority 2: External wallet disconnected
    else if (!connected && activeWalletType === 'external') {
      console.log('🔌 External wallet disconnected')
      setWalletConnectionState('disconnected')
      setActiveWalletType(null)
      sessionStorage.removeItem('active_wallet_type')
    }
    // Priority 3: Embedded wallet (only if no external wallet)
    else if (isEmbeddedWallet && embeddedWallet && !connected && !activeWalletType) {
      console.log('🔗 Setting embedded wallet as active (delayed activation)')
      setWalletConnectionState('connected')
      setActiveWalletType('embedded')
      setWalletError(null) // Clear any errors
      // Persist to session storage
      sessionStorage.setItem('active_wallet_type', 'embedded')
      console.log('✅ Embedded wallet connected (delayed):', embeddedWallet.address)
    }
  }, [connected, publicKey, isEmbeddedWallet, embeddedWallet, activeWalletType, isSwitchingWallet])

  // Fetch balance when wallet connects with cleanup
  useEffect(() => {
    let isMounted = true

    const fetchBalance = async () => {
      if (!isMounted) return
      await getBalance()
    }

    if (isWalletConnected && (publicKey || embeddedWallet)) {
      fetchBalance()
      // Don't auto-check x402 status - wait for user to click "Start Learning"
    }

    // Cleanup function to prevent setState on unmounted component
    return () => {
      isMounted = false
    }
  }, [isWalletConnected, publicKey, embeddedWallet])

  // Verify x402 access when payment status or wallet connection changes
  useEffect(() => {
    let isMounted = true

    const verifyAccess = async () => {
      if (!isMounted) return
      await verifyX402Access()
    }

    if (isWalletConnected && hasClickedStart) {
      verifyAccess()
    }

    // Cleanup function to prevent setState on unmounted component
    return () => {
      isMounted = false
    }
  }, [isWalletConnected, hasPaid, hasClickedStart])

  // Persist payment state to localStorage keyed by wallet address
  // This allows users to close the browser and return without losing progress
  useEffect(() => {
    if (currentWalletAddress && hasPaid) {
      const paymentKey = `payment_${currentWalletAddress}`
      localStorage.setItem(paymentKey, JSON.stringify({
        paid: true,
        timestamp: new Date().toISOString(),
        amount: PAYMENT_AMOUNT
      }))
      console.log(`💾 Payment state saved for wallet ${currentWalletAddress.slice(0, 8)}...`)
    }
  }, [hasPaid, currentWalletAddress])

  // Load payment state from localStorage when wallet connects
  // This restores payment state if user closes browser and returns
  useEffect(() => {
    if (currentWalletAddress && !hasPaid) {
      const paymentKey = `payment_${currentWalletAddress}`
      const savedPayment = localStorage.getItem(paymentKey)

      if (savedPayment) {
        try {
          const paymentData = JSON.parse(savedPayment)

          // Check if payment is recent (within 24 hours for demo purposes)
          const paymentTime = new Date(paymentData.timestamp)
          const hoursSincePayment = (Date.now() - paymentTime.getTime()) / (1000 * 60 * 60)

          if (hoursSincePayment < 24 && paymentData.paid) {
            setHasPaid(true)
            console.log(`✅ Payment state restored for wallet ${currentWalletAddress.slice(0, 8)}... (${hoursSincePayment.toFixed(1)}h ago)`)
          } else {
            // Payment too old, clear it
            localStorage.removeItem(paymentKey)
            console.log(`🗑️ Payment state expired for wallet ${currentWalletAddress.slice(0, 8)}...`)
          }
        } catch (error) {
          console.error('Error loading payment state:', error)
          localStorage.removeItem(paymentKey)
        }
      }
    }
  }, [currentWalletAddress])

  // Development debugging helper - exposes wallet state to console
  useEffect(() => {
    if (import.meta.env.DEV) {
      window._debugWalletState = () => {
        const state = {
          // Wallet state
          embeddedWallet,
          isEmbeddedWallet,
          activeWalletType,
          connected,
          publicKey: publicKey?.toBase58(),
          // Computed values
          isWalletConnected,
          currentWalletAddress,
          balance,
          hasPaid,
          // Storage
          localStorage: {
            cdp_user_id: localStorage.getItem('cdp_user_id'),
            cdp_wallet_address: localStorage.getItem('cdp_wallet_address'),
            payment_state: currentWalletAddress ? localStorage.getItem(`payment_${currentWalletAddress}`) : 'no wallet'
          },
          sessionStorage: {
            active_wallet_type: sessionStorage.getItem('active_wallet_type')
          },
          // Connection state
          walletConnectionState,
          walletError
        }
        console.table(state)
        return state
      }
      console.log('💡 Debug wallet state: window._debugWalletState()')
    }
  }, [embeddedWallet, isEmbeddedWallet, activeWalletType, connected, publicKey, isWalletConnected, currentWalletAddress, balance, hasPaid, walletConnectionState, walletError])

  // Disconnect/switch wallet function - clears active wallet and resets session
  const handleDisconnectWallet = async () => {
    setIsSwitchingWallet(true)

    try {
      if (activeWalletType === 'embedded') {
        // IMPORTANT: Don't clear localStorage - keep CDP wallet data for future reconnection
        // Only clear the active session state
        // User can explicitly delete wallet if they want a new one
        setEmbeddedWallet(null)
        setIsEmbeddedWallet(false)
        console.log('🔌 Disconnecting CDP wallet (localStorage preserved for reconnection)')
      } else if (activeWalletType === 'external') {
        // Properly disconnect external wallet (Phantom/Coinbase)
        if (disconnect) {
          console.log('🔌 Disconnecting external wallet...')
          await disconnect()
          // Wait for disconnect to propagate through wallet adapter
          await new Promise(resolve => setTimeout(resolve, 300))
          console.log('✅ External wallet disconnected')
        }
      }

      // Clear session storage (determines which wallet is currently active)
      sessionStorage.removeItem('active_wallet_type')

      // Reset wallet state
      setActiveWalletType(null)
      setWalletConnectionState('disconnected')
      setBalance(null)
      setHasPaid(false)  // Reset payment status so user can choose a different wallet

      // CRITICAL: Reset all session state to prevent users from continuing previous sessions
      setModulesCompleted(0)
      setTotalEarned(0)
      setRewardHistory([])
      setCurrentReward(null)
      setShowRewardModal(false)
      setSessionKey(prev => prev + 1)  // Force ChatInterface to remount with fresh state
      setHasClickedStart(false)  // Reset "Start Learning" state
      setX402Status(null)  // Clear 402 status
      setWalletError(null)  // Clear any errors
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error)
      setWalletError({
        message: 'Failed to disconnect wallet properly',
        technical: error.message
      })
      // Still reset state even if disconnect fails
      setActiveWalletType(null)
      setWalletConnectionState('disconnected')
    } finally {
      setIsSwitchingWallet(false)
    }
  }

  const requestFaucet = async () => {
    // Support both external wallets (Phantom) and CDP wallets
    const targetAddress = publicKey?.toBase58() || embeddedWallet?.address

    if (!targetAddress) {
      console.error('No wallet address available for faucet request')
      return
    }

    setIsRequestingFaucet(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/faucet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: targetAddress
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
      console.log('View on Solana Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`)
      setHasPaid(true)

      // Auto-refresh balance after payment (wait a moment for network propagation)
      setTimeout(() => {
        getBalance()
      }, 1500)

      // Show success message with clickable link in console
      alert(`Payment successful! ✅\n\nYou paid ${PAYMENT_AMOUNT} SOL to unlock the Solana x402 learning platform.\nComplete 3 learning modules to earn it back!\n\nTransaction Hash: ${signature}\n\nView on Solana Explorer:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet\n\n(Check your browser console for a clickable link)`)

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
        console.log('View on Solana Explorer:', `https://explorer.solana.com/tx/${data.signature}?cluster=devnet`)
        setHasPaid(true)

        // Auto-refresh balance after payment (wait a moment for network propagation)
        setTimeout(() => {
          getBalance()
        }, 1500)

        alert(`Payment successful! ✅\n\nYou paid ${PAYMENT_AMOUNT} SOL to unlock the Solana x402 learning platform.\nComplete 3 learning modules to earn it back!\n\nTransaction Hash: ${data.signature}\n\nView on Solana Explorer:\nhttps://explorer.solana.com/tx/${data.signature}?cluster=devnet\n\n(Check your browser console for a clickable link)`)
      }
    } catch (error) {
      console.error('Embedded payment error:', error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const handleSessionComplete = () => {
    // Clear payment state from localStorage so user can start fresh
    if (currentWalletAddress) {
      const paymentKey = `payment_${currentWalletAddress}`
      localStorage.removeItem(paymentKey)
      console.log(`🗑️ Payment state cleared for wallet ${currentWalletAddress.slice(0, 8)}... (session complete)`)
    }

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
    console.log(`Reward sent: ${moduleResult.reward} SOL for completing: ${moduleResult.module}`)

    // Auto-refresh balance after reward (wait a moment for network propagation)
    setTimeout(() => {
      getBalance()
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo - ASCII art styling */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink">
              {/* ASCII bracket decoration - hidden on mobile */}
              <span className="hidden md:inline text-xl font-mono text-solana-purple">
                [
              </span>

              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-solana-green" />
                <h1 className="text-base md:text-xl font-mono font-bold bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent truncate">
                  learnearn.xyz
                </h1>
              </div>

              {/* ASCII bracket decoration - hidden on mobile */}
              <span className="hidden md:inline text-xl font-mono text-solana-green">
                ]
              </span>
            </div>

            {/* Wallet Connection - Responsive layout */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {/* Show wallet connection status or buttons */}
              {walletConnectionState === 'reconnecting' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Reconnecting...</span>
                </div>
              )}

              {/* Show wallet buttons if no wallet is connected */}
              {!activeWalletType && (
                <>
                  {/* CDP Wallet Button - Desktop */}
                  <div className="hidden md:block">
                    <EmbeddedWalletButton
                      key={embeddedWallet?.userId || 'no-wallet'}
                      onWalletCreated={(wallet) => {
                        const userId = localStorage.getItem('cdp_user_id')
                        if (userId && wallet.address) {
                          setEmbeddedWallet({ userId, address: wallet.address })
                          setIsEmbeddedWallet(true)
                          setActiveWalletType('embedded')
                          getBalance()
                        }
                      }}
                    />
                  </div>

                  {/* CDP Wallet Button - Mobile */}
                  <div className="md:hidden">
                    <EmbeddedWalletButton
                      key={embeddedWallet?.userId || 'no-wallet'}
                      onWalletCreated={(wallet) => {
                        const userId = localStorage.getItem('cdp_user_id')
                        if (userId && wallet.address) {
                          setEmbeddedWallet({ userId, address: wallet.address })
                          setIsEmbeddedWallet(true)
                          setActiveWalletType('embedded')
                          getBalance()
                        }
                      }}
                    />
                  </div>

                  <div className="hidden md:block h-8 w-px bg-border" />

                  {/* Browser Wallet Button - Desktop */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30 transition-colors">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="64" cy="64" r="64" fill="#AB9FF2"/>
                        <path d="M85.5 45.5C85.5 38.5964 79.9036 33 72.9999 33H47.5001C42.5295 33 38.5 37.0294 38.5 42.0001V86C38.5 90.9706 42.5295 95 47.5001 95H80.4999C85.4705 95 89.5 90.9706 89.5 86V59C89.5 51.5442 83.4558 45.5 76 45.5H85.5Z" fill="white"/>
                        <circle cx="76" cy="54" r="4" fill="#AB9FF2"/>
                        <circle cx="64" cy="54" r="4" fill="#AB9FF2"/>
                      </svg>
                    </div>
                    <WalletMultiButton style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '14px', fontWeight: '600' }} />
                  </div>
                </>
              )}

              {/* Show disconnect/switch button when wallet is connected */}
              {activeWalletType && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-xs">
                    {getWalletDisplayName()}
                  </Badge>
                  <Button
                    onClick={handleDisconnectWallet}
                    variant="outline"
                    size="sm"
                    className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                  >
                    <span className="hidden sm:inline">Switch</span>
                    <span className="sm:hidden">⟳</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner - Shows wallet and connection errors */}
      {walletError && (
        <div className="bg-red-900/20 border-b border-red-500/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 text-red-400 mt-0.5">⚠️</div>
                <div className="flex-1">
                  <p className="text-red-200 font-medium">{walletError.message}</p>
                  {walletError.technical && (
                    <p className="text-red-300/70 text-sm mt-1">
                      Technical: {walletError.technical}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setWalletError(null)}
                className="text-red-300 hover:text-red-100 transition-colors px-2 py-1 rounded hover:bg-red-800/30"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        {!isWalletConnected ? (
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="text-center space-y-8 mb-16">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight font-mono">
                  <span className="bg-gradient-to-r from-solana-purple via-purple-400 to-solana-green bg-clip-text text-transparent">
                    Learn AI Agents
                  </span>
                  <br />
                  <span className="text-solana-green">
                    Earn SOL
                  </span>
                </h2>

                {/* Command-line styled subheading */}
                <div className="text-base md:text-lg max-w-3xl mx-auto">
                  <pre className="font-mono text-left inline-block text-sm md:text-base leading-relaxed">
<span className="text-solana-green">$</span> <span className="text-gray-400">answer</span> <span className="text-solana-purple">3_questions</span>
<span className="text-solana-green">$</span> <span className="text-gray-400">earn_back</span> <span className="text-solana-purple">deposit</span>
<span className="text-solana-green">$</span> <span className="text-gray-400">keep_it</span> <span className="text-solana-purple">simple</span>
                  </pre>
                </div>
              </div>

              {/* Value Props - Static info pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-solana-purple/5 pointer-events-none">
                  <Bot className="w-4 h-4 text-solana-purple" />
                  <span className="text-xs md:text-sm text-muted-foreground">AI Evaluation</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-solana-green/5 pointer-events-none">
                  <Zap className="w-4 h-4 text-solana-green" />
                  <span className="text-xs md:text-sm text-muted-foreground">Earn 0.033 SOL</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/5 pointer-events-none">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span className="text-xs md:text-sm text-muted-foreground">3 Modules</span>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-12 space-y-6">
                <div className="space-y-3">
                  <p className="text-lg md:text-xl font-semibold text-foreground">
                    Connect wallet to start
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/30 rounded text-xs text-muted-foreground pointer-events-none">
                  <Sparkles className="w-3 h-3" />
                  Test Network (Devnet)
                </div>
              </div>
            </div>

            {/* Wallet Connection Cards - Seamless design */}
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {/* Embedded Wallet - Emphasized */}
              <button
                onClick={() => {
                  // Trigger the embedded wallet button click
                  document.querySelector('.embedded-wallet-button')?.click()
                }}
                className="group relative p-8 rounded-2xl border border-solana-green/30 bg-gradient-to-br from-solana-green/5 to-transparent hover:from-solana-green/10 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-solana-green/0 via-solana-green/10 to-solana-green/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <Wallet className="w-8 h-8 text-solana-green" />
                    <Badge className="bg-solana-green/20 text-solana-green border-solana-green/30 font-mono text-xs">
                      Recommended
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold mb-2">Embedded Wallet</h3>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    Email sign-in • No extension needed • Mobile-friendly
                  </p>

                  <p className="text-xs text-gray-500 mb-4 font-mono">
                    Powered by Coinbase Developer Platform
                  </p>

                  <div className="flex items-center text-solana-green text-sm font-mono group-hover:translate-x-1 transition-transform">
                    Get Started
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>

                {/* Hidden actual button */}
                <div className="hidden">
                  <EmbeddedWalletButton
                    key={embeddedWallet?.userId || 'no-wallet'}
                    onWalletCreated={(wallet) => {
                      const userId = localStorage.getItem('cdp_user_id')
                      if (userId && wallet.address) {
                        setEmbeddedWallet({ userId, address: wallet.address })
                        setIsEmbeddedWallet(true)
                        setActiveWalletType('embedded')
                        getBalance()
                      }
                    }}
                    dataAttribute="embedded-wallet-button"
                  />
                </div>
              </button>

              {/* Browser Wallet - Standard option */}
              <button
                onClick={() => {
                  // Trigger the wallet multi button
                  document.querySelector('.wallet-adapter-button')?.click()
                }}
                className="group relative p-8 rounded-2xl border border-solana-purple/30 bg-gradient-to-br from-solana-purple/5 to-transparent hover:from-solana-purple/10 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="relative z-10">
                  <Wallet className="w-8 h-8 text-solana-purple mb-4" />

                  <h3 className="text-xl font-bold mb-2">Browser Wallet</h3>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    Phantom • Coinbase • Solflare • Advanced users
                  </p>

                  <div className="flex items-center text-solana-purple text-sm font-mono group-hover:translate-x-1 transition-transform">
                    Connect Wallet
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>

                {/* Hidden actual button */}
                <div className="hidden">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg">
                    <WalletMultiButton style={{ background: 'transparent', border: 'none', padding: 0 }} />
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Wallet Connected!
                  {activeWalletType && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {getWalletDisplayName()}
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
              !hasClickedStart ? (
                // Welcome screen - shown before 402 error
                <Card className="border-2 border-solana-green/50">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center text-4xl mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl">Ready to Start Learning?</CardTitle>
                    <CardDescription className="text-base">
                      You're about to access Solana x402 learning platform.
                      Complete 3 modules about AI agents and earn rewards!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Sparkles className="w-6 h-6 text-solana-purple" />
                        <span className="text-sm">Learn 3 Solana x402 concepts</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <TrendingUp className="w-6 h-6 text-solana-green" />
                        <span className="text-sm">Earn 0.011 SOL per module</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Target className="w-6 h-6 text-solana-purple" />
                        <span className="text-sm">Get rewarded for learning!</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setHasClickedStart(true)
                        verifyX402Access()  // Trigger 402 check when user clicks start
                      }}
                      variant="solana"
                      size="lg"
                      className="w-full"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // Payment screen - shown after clicking "Start Learning"
                <Card className="border-2 border-solana-purple/50">
                  <CardHeader className="text-center">
                    {/* X402 Protocol Status Display */}
                    {x402Status && (
                      <div className="mb-6 p-4 bg-orange-500/10 border-2 border-orange-500/30 rounded-lg">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <Badge variant="destructive" className="text-lg px-4 py-2 font-mono">
                            HTTP {x402Status.statusCode}
                          </Badge>
                          <Badge variant="outline" className="text-sm">
                            Payment Required
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {x402Status.message}
                        </p>
                        <div className="mt-3 p-3 bg-muted/50 rounded text-xs font-mono text-left">
                          <div className="font-semibold text-orange-500 mb-2">X402 Protocol Headers:</div>
                          <div>X-Payment-Required: {x402Status.headers['X-Payment-Required']}</div>
                          <div>X-Payment-Amount: {x402Status.headers['X-Payment-Amount']}</div>
                          <div>X-Payment-Network: {x402Status.headers['X-Payment-Network']}</div>
                        </div>
                      </div>
                    )}

                    <div className="w-16 h-16 rounded-full bg-solana-purple/10 flex items-center justify-center text-4xl mx-auto mb-4">
                      <Lock className="w-8 h-8 text-solana-purple" />
                    </div>
                    <CardTitle className="text-3xl">Unlock Learning Platform</CardTitle>
                    <CardDescription className="text-base">
                      Pay <strong className="text-solana-green">{PAYMENT_AMOUNT} SOL</strong> to access the Solana x402 learning modules.
                      Complete all 3 modules to earn your payment back!
                    </CardDescription>
                  </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <Sparkles className="w-6 h-6 text-solana-purple" />
                      <span className="text-sm">Learn 3 Solana x402 concepts</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <TrendingUp className="w-6 h-6 text-solana-green" />
                      <span className="text-sm">Earn 0.011 SOL per module</span>
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
                        {isRequestingFaucet ? 'Requesting...' : 'Get 0.1 SOL'}
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
              )
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
                        {modulesCompleted}/3
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
                  onReturnHome={handleDisconnectWallet}
                  walletAddress={currentWalletAddress}
                  isEmbeddedWallet={isEmbeddedWallet}
                />
              </>
            )}
          </div>
        )}
      </main>

      {/* Technology Showcase Banner */}
      <TechBanner />

      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Disclaimer */}
            <div className="text-sm text-gray-400 font-mono text-center md:text-left">
              <span className="text-solana-purple">[ </span>
              Educational Project
              <span className="text-solana-green"> ]</span>
              <span className="mx-2">·</span>
              Solana x402 DevNet Submission
            </div>

            {/* Right: Links */}
            <div className="flex items-center gap-6 text-sm">
              <a
                href="https://github.com/hewi333/Solanax402-Hackathon"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-solana-purple transition-colors font-mono"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Source Code
              </a>
              <a
                href="https://solana.com/x402/hackathon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-solana-green transition-colors font-mono"
              >
                About x402 Hackathon
              </a>
            </div>
          </div>
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
