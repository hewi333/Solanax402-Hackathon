import { useState, useEffect } from 'react'
import axios from 'axios'
import { RefreshCw } from 'lucide-react'

/**
 * EmbeddedWalletButton Component
 *
 * Allows users to create and manage Coinbase CDP embedded wallets
 * No browser extension required - wallets are created via API
 */
export default function EmbeddedWalletButton({ onWalletCreated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [walletInfo, setWalletInfo] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const createEmbeddedWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if user already has a wallet in localStorage
      const existingUserId = localStorage.getItem('cdp_user_id')
      const existingAddress = localStorage.getItem('cdp_wallet_address')

      if (existingUserId && existingAddress) {
        console.log('Found existing wallet in localStorage, loading instead of creating new one...')
        console.log('User ID:', existingUserId)
        console.log('Address:', existingAddress)

        // Load existing wallet instead of creating a new one
        await loadExistingWallet()
        return
      }

      // Generate a unique user ID (in production, use actual user authentication)
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log('Creating new embedded wallet for user:', userId)
      console.log('API URL:', API_URL)

      const response = await axios.post(`${API_URL}/api/cdp/create-wallet`, {
        userId
      })

      if (response.data.success) {
        const wallet = response.data.wallet
        setWalletInfo(wallet)

        // Store user ID in localStorage for future reference
        localStorage.setItem('cdp_user_id', userId)
        localStorage.setItem('cdp_wallet_address', wallet.address)

        console.log('✅ Embedded wallet created:', wallet)

        // Notify parent component
        if (onWalletCreated) {
          onWalletCreated(wallet)
        }
      }
    } catch (err) {
      console.error('❌ Failed to create embedded wallet:', err)
      console.error('Error response:', err.response?.data)

      let errorMessage = 'Failed to create wallet. Please try again.'
      let hints = []

      if (err.response?.data) {
        const errorData = err.response.data
        errorMessage = errorData.error || errorMessage
        hints = errorData.hints || []

        // Log detailed error info
        if (errorData.errorType) console.error('Error type:', errorData.errorType)
        if (errorData.errorCode) console.error('Error code:', errorData.errorCode)
        if (errorData.timestamp) console.error('Error timestamp:', errorData.timestamp)
      } else if (err.response?.status === 503) {
        errorMessage = 'CDP service not configured. Please add API credentials to Railway backend.'
      } else if (err.message) {
        errorMessage = err.message
      }

      // Combine error message with hints
      if (hints.length > 0) {
        errorMessage = `${errorMessage}\n\nTroubleshooting:\n${hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadExistingWallet = async () => {
    try {
      const userId = localStorage.getItem('cdp_user_id')
      if (!userId) return

      setLoading(true)
      const response = await axios.get(`${API_URL}/api/cdp/wallet/${userId}`)

      if (response.data.success) {
        setWalletInfo(response.data.wallet)
        if (onWalletCreated) {
          onWalletCreated(response.data.wallet)
        }
      }
    } catch (err) {
      console.error('Failed to load wallet:', err)
      // If wallet not found, clear localStorage
      if (err.response?.status === 404) {
        localStorage.removeItem('cdp_user_id')
        localStorage.removeItem('cdp_wallet_address')
      }
    } finally {
      setLoading(false)
    }
  }

  // Try to load existing wallet on mount
  useEffect(() => {
    const existingUserId = localStorage.getItem('cdp_user_id')
    if (existingUserId) {
      loadExistingWallet()
    }
  }, [])

  // Check if wallet exists in localStorage to show appropriate button text
  const hasExistingWallet = localStorage.getItem('cdp_user_id') && localStorage.getItem('cdp_wallet_address')

  return (
    <div className="embedded-wallet-container w-full">
      {!walletInfo ? (
        <button
          onClick={createEmbeddedWallet}
          disabled={loading}
          className="wallet-button embedded-wallet-button group relative w-full"
          style={{
            backgroundColor: '#14F195',
            color: '#0a0a0a',
            padding: '10px 20px',
            borderRadius: '8px',
            border: '2px solid #14F195',
            fontSize: '15px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(20, 241, 149, 0.3)',
            transform: loading ? 'scale(1)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(20, 241, 149, 0.5)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(20, 241, 149, 0.3)'
            }
          }}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" style={{ strokeWidth: '2.5px' }} />
              <span>{hasExistingWallet ? 'Connecting...' : 'Creating Wallet...'}</span>
            </>
          ) : (
            <>
              {/* Coinbase Logo */}
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#0a0a0a"/>
                <path d="M24 8C15.163 8 8 15.163 8 24C8 32.837 15.163 40 24 40C32.837 40 40 32.837 40 24C40 15.163 32.837 8 24 8ZM24 30C20.686 30 18 27.314 18 24C18 20.686 20.686 18 24 18C27.314 18 30 20.686 30 24C30 27.314 27.314 30 24 30Z" fill="#14F195"/>
              </svg>
              <span>{hasExistingWallet ? 'Connect Wallet' : 'Create Wallet'}</span>
            </>
          )}
        </button>
      ) : (
        <div className="wallet-info" style={{
          backgroundColor: 'rgba(20, 241, 149, 0.1)',
          border: '2px solid rgba(20, 241, 149, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <div style={{ fontWeight: '600', color: '#14F195', marginBottom: '4px', fontSize: '14px' }}>
            Coinbase Wallet Connected
          </div>
          <div style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
            {walletInfo.address.slice(0, 8)}...{walletInfo.address.slice(-8)}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '12px',
          padding: '14px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          borderRadius: '8px',
          fontSize: '13px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          maxWidth: '100%'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚠️</span>
            <span>Connection Error</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px', color: '#fca5a5' }}>
            {error}
          </div>
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#a3a3a3',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid rgba(234, 179, 8, 0.3)'
          }}>
            <strong style={{ color: '#fbbf24' }}>💡 Tip:</strong> Check your backend configuration at <code style={{ fontSize: '11px', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '2px 4px', borderRadius: '3px' }}>/api/cdp/test</code>
          </div>
        </div>
      )}
    </div>
  )
}
