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

        console.log('Embedded wallet created:', wallet)

        // Notify parent component
        if (onWalletCreated) {
          onWalletCreated(wallet)
        }
      }
    } catch (err) {
      console.error('Failed to create embedded wallet:', err)
      console.error('Error response:', err.response?.data)

      let errorMessage = 'Failed to create wallet. Please try again.'

      if (err.response?.status === 503) {
        errorMessage = 'CDP service not configured. Please add API credentials to Railway backend.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
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
            border: '2px solid #0052FF',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(0, 82, 255, 0.3)'
          }}
        >
          {loading ? (
            <>
              <span className="spinner">⏳</span>
              Creating...
            </>
          ) : (
            <>
              {/* Coinbase Logo */}
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="white"/>
                <path d="M24 8C15.163 8 8 15.163 8 24C8 32.837 15.163 40 24 40C32.837 40 40 32.837 40 24C40 15.163 32.837 8 24 8ZM24 30C20.686 30 18 27.314 18 24C18 20.686 20.686 18 24 18C27.314 18 30 20.686 30 24C30 27.314 27.314 30 24 30Z" fill="#0052FF"/>
              </svg>
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
          padding: '12px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '8px',
          fontSize: '13px',
          border: '1px solid #fcc',
          maxWidth: '400px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>⚠️ Error</div>
          {error}
          {error.includes('not configured') && (
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#666',
              backgroundColor: '#fff3cd',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ffc107'
            }}>
              <strong>Setup Required:</strong> To enable embedded wallets, add CDP API credentials to your Railway backend.
              See CDP_INTEGRATION_GUIDE.md for instructions.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
