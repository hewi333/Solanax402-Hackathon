import { useState, useEffect } from 'react'
import axios from 'axios'

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

      // Generate a unique user ID (in production, use actual user authentication)
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log('Creating embedded wallet for user:', userId)

      const response = await axios.post(`${API_URL}/api/cdp/create-wallet`, {
        userId
      })

      if (response.data.success) {
        const wallet = response.data.wallet
        setWalletInfo(wallet)

        // Store user ID in localStorage for future reference
        localStorage.setItem('cdp_user_id', userId)
        localStorage.setItem('cdp_wallet_address', wallet.address)

        console.log('Embedded wallet created:', wallet)

        // Notify parent component
        if (onWalletCreated) {
          onWalletCreated(wallet)
        }
      }
    } catch (err) {
      console.error('Failed to create embedded wallet:', err)
      setError(err.response?.data?.error || 'Failed to create wallet. Please try again.')
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

  return (
    <div className="embedded-wallet-container">
      {!walletInfo ? (
        <button
          onClick={createEmbeddedWallet}
          disabled={loading}
          className="wallet-button embedded-wallet-button"
          style={{
            backgroundColor: '#0052FF',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner">⏳</span>
              Creating Wallet...
            </>
          ) : (
            <>
              <span>🏦</span>
              Create Embedded Wallet
            </>
          )}
        </button>
      ) : (
        <div className="wallet-info" style={{
          backgroundColor: '#f0f9ff',
          border: '2px solid #0052FF',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <div style={{ fontWeight: '600', color: '#0052FF', marginBottom: '4px' }}>
            Coinbase Embedded Wallet
          </div>
          <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
            {walletInfo.address.slice(0, 8)}...{walletInfo.address.slice(-8)}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
