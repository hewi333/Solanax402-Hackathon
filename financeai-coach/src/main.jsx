import { StrictMode, useMemo, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter, CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile'
import { clusterApiUrl } from '@solana/web3.js'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

function Root() {
  // Use devnet for development
  const network = WalletAdapterNetwork.Devnet

  // Use custom RPC or default
  const endpoint = useMemo(() => {
    const customRpc = import.meta.env.VITE_SOLANA_RPC_HOST
    return customRpc || clusterApiUrl(network)
  }, [network])

  // Setup wallets - Mobile wallet adapter should be first for mobile device detection
  // Supporting multiple wallet providers: Phantom and Coinbase for best user experience
  const wallets = useMemo(
    () => [
      new SolanaMobileWalletAdapter({
        appIdentity: { name: 'x402 Finance AI Coach' },
        authorizationResultCache: {
          // Cache authorization results on mobile for better UX
          get: async () => null,
          set: async () => {},
          clear: async () => {},
        },
      }),
      new PhantomWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  )

  // Handle wallet adapter errors gracefully
  const onError = useCallback((error) => {
    console.error('Wallet adapter error:', error)

    // User-friendly error messages
    let message = 'Wallet connection failed. Please try again.'

    if (error.message?.includes('User rejected')) {
      message = 'Wallet connection cancelled by user.'
    } else if (error.message?.includes('not installed')) {
      message = 'Wallet not found. Please install the wallet extension.'
    } else if (error.message?.includes('network')) {
      message = 'Network error. Please check your connection.'
    }

    // Show error to user (will be logged, app won't crash)
    console.warn('User-facing error:', message)

    // TODO: Consider showing a toast notification instead of console
    // showToast(message, 'error')
  }, [])

  return (
    <StrictMode>
      <ErrorBoundary>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} onError={onError}>
            <WalletModalProvider>
              <App />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
