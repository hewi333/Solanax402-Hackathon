import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile'
import { clusterApiUrl } from '@solana/web3.js'
import './index.css'
import App from './App.jsx'

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
    ],
    []
  )

  return (
    <StrictMode>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <App />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
