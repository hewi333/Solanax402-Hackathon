import { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import EmbeddedWalletButton from './EmbeddedWalletButton'

/**
 * WalletTypeSelector Component
 *
 * Allows users to choose between:
 * 1. Browser Wallets (Phantom, Coinbase Wallet extension)
 * 2. Embedded Wallets (CDP managed, no extension needed)
 *
 * Shows both sponsor brands: Phantom and Coinbase
 */
export default function WalletTypeSelector({ onWalletConnected }) {
  const [selectedType, setSelectedType] = useState(null)

  const handleEmbeddedWalletCreated = (wallet) => {
    console.log('Embedded wallet created:', wallet)
    if (onWalletConnected) {
      onWalletConnected({ type: 'embedded', wallet })
    }
  }

  return (
    <div className="wallet-type-selector" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
        color: 'white',
        textAlign: 'center'
      }}>
        Connect Your Wallet
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Browser Wallet Option */}
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#ddd'
          }}>
            Browser Wallet
          </div>
          <div style={{
            fontSize: '12px',
            color: '#999',
            marginBottom: '12px'
          }}>
            Connect with Phantom, Coinbase Wallet, or other browser extensions
          </div>
          <WalletMultiButton style={{
            width: '100%',
            justifyContent: 'center'
          }} />
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '8px 0'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '600' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Embedded Wallet Option */}
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 82, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 82, 255, 0.2)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#0052FF'
          }}>
            Embedded Wallet (Coinbase CDP)
          </div>
          <div style={{
            fontSize: '12px',
            color: '#999',
            marginBottom: '12px'
          }}>
            No browser extension needed - wallet managed by Coinbase
          </div>
          <EmbeddedWalletButton onWalletCreated={handleEmbeddedWalletCreated} />
        </div>
      </div>

      {/* Sponsor Recognition */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#666',
          marginBottom: '8px'
        }}>
          Powered by our sponsors
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12px',
          color: '#999'
        }}>
          <span style={{ fontWeight: '600' }}>👻 Phantom</span>
          <span style={{ color: '#444' }}>•</span>
          <span style={{ fontWeight: '600', color: '#0052FF' }}>🏦 Coinbase</span>
        </div>
      </div>
    </div>
  )
}
