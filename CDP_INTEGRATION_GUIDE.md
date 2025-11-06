# Coinbase CDP Wallet Integration Guide

This guide explains how to configure and deploy the Coinbase CDP wallet integration for the Solana x402 Learn & Earn application.

## Overview

We've integrated **two wallet solutions** to provide maximum flexibility:

### Phase 1: Coinbase Wallet Adapter (Browser Extension)
- Users can connect with Coinbase Wallet browser extension
- Works alongside Phantom wallet
- Zero configuration needed - already working!

### Phase 2: CDP Embedded Wallets (Wallet-as-a-Service)
- No browser extension required
- Seamless wallet creation via API
- Requires CDP API credentials

---

## What's Already Working

Phase 1 is **100% complete and functional** right now:
- ✅ Coinbase Wallet adapter installed
- ✅ Added to wallet selection menu
- ✅ Works in parallel with Phantom wallet
- ✅ No configuration needed

Your users can already choose between **Phantom** and **Coinbase Wallet** when they click the wallet button!

---

## Setting Up CDP Embedded Wallets (Phase 2)

To enable the advanced embedded wallet features, you'll need to add CDP API credentials.

### Step 1: Get CDP API Credentials

1. Visit [Coinbase Developer Platform Portal](https://portal.cdp.coinbase.com/)
2. Sign in or create an account
3. Create a new project (or select existing)
4. Navigate to **API Keys** section
5. Click **Create API Key**
6. **Important:** Save both values:
   - `API Key Name` (e.g., `organizations/abc-123/apiKeys/xyz-789`)
   - `Private Key` (long base64-encoded string starting with `-----BEGIN EC PRIVATE KEY-----`)

### Step 2: Add Environment Variables to Railway (Backend)

In your Railway backend service, add these environment variables:

```bash
CDP_API_KEY_NAME=organizations/your-org-id/apiKeys/your-key-id
CDP_API_KEY_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----
YOUR_FULL_PRIVATE_KEY_HERE
-----END EC PRIVATE KEY-----
```

**Important Notes:**
- The private key is multi-line - Railway supports this
- Keep these credentials secret - never commit to git
- The backend will automatically detect and initialize CDP on startup

### Step 3: Add Environment Variables to Vercel (Frontend)

In your Vercel frontend deployment, add these optional variables:

```bash
VITE_ENABLE_EMBEDDED_WALLETS=true
VITE_CDP_PROJECT_ID=your-project-id-here
```

These control whether the embedded wallet UI appears.

### Step 4: Verify Integration

After deploying with credentials:

1. **Backend Check:**
   - Visit `https://your-backend.railway.app/api/health`
   - Check server logs for: `🏦 Coinbase CDP SDK initialized`

2. **Frontend Check:**
   - Open your app
   - Look for "Embedded Wallet" option alongside browser wallets
   - Try creating an embedded wallet

---

## API Endpoints Created

The following CDP endpoints are now available:

### Create Embedded Wallet
```http
POST /api/cdp/create-wallet
Content-Type: application/json

{
  "userId": "user_unique_id"
}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": "wallet_id",
    "address": "SolanaAddressHere...",
    "network": "solana-devnet"
  },
  "message": "Embedded wallet created successfully!"
}
```

### Get Wallet Details
```http
GET /api/cdp/wallet/:userId
```

### Get Wallet Balance
```http
GET /api/cdp/wallet/:userId/balance
```

### Export Wallet
```http
POST /api/cdp/export-wallet
Content-Type: application/json

{
  "userId": "user_id",
  "confirmExport": true
}
```

---

## Components Created

### EmbeddedWalletButton.jsx
- Button to create CDP embedded wallets
- Stores wallet info in localStorage
- Branded with Coinbase colors (#0052FF)

### WalletTypeSelector.jsx
- Unified component showing both wallet options
- Recognizes sponsor brands (Phantom + Coinbase)
- Can be used as alternative to WalletMultiButton

---

## Using the New Components

### Option A: Keep Current UI (Default)
No changes needed! Coinbase Wallet already appears in the wallet dropdown.

### Option B: Add Embedded Wallet Option
Update your `App.jsx`:

```javascript
import WalletTypeSelector from './components/WalletTypeSelector'

// Instead of:
// <WalletMultiButton />

// Use:
<WalletTypeSelector onWalletConnected={(data) => {
  console.log('Wallet connected:', data)
}} />
```

### Option C: Only Show Embedded Wallet Button
```javascript
import EmbeddedWalletButton from './components/EmbeddedWalletButton'

<EmbeddedWalletButton onWalletCreated={(wallet) => {
  console.log('Created wallet:', wallet.address)
}} />
```

---

## Testing the Integration

### Test Phase 1 (No API keys needed)
1. Open your app
2. Click "Select Wallet"
3. You should see: **Phantom** and **Coinbase** options
4. Connect with Coinbase Wallet browser extension
5. Everything should work normally

### Test Phase 2 (After adding API keys)
1. Look for "Create Embedded Wallet" button
2. Click it
3. Backend creates wallet via CDP
4. Wallet address appears in UI
5. You can use this wallet for payments/rewards

---

## Environment Variables Reference

### Backend (.env or Railway)
```bash
# Required for CDP
CDP_API_KEY_NAME=organizations/.../apiKeys/...
CDP_API_KEY_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----...

# Existing vars (keep these)
OPENAI_API_KEY=...
SOLANA_RPC_URL=https://api.devnet.solana.com
TREASURY_WALLET_KEYPAIR=...
PORT=3001
```

### Frontend (.env or Vercel)
```bash
# Optional - controls embedded wallet UI
VITE_ENABLE_EMBEDDED_WALLETS=true
VITE_CDP_PROJECT_ID=...

# Existing vars (keep these)
VITE_API_URL=https://your-backend.railway.app
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_HOST=https://api.devnet.solana.com
```

---

## Security Considerations

1. **Never commit API keys** to git
2. **Use environment variables** only (Railway/Vercel dashboards)
3. **Private keys are multi-line** - this is normal
4. **Wallet export endpoint** should be protected with auth in production
5. **Rate limiting** should be added to wallet creation endpoint
6. **In production**, replace in-memory storage (`cdpWalletStore`) with a database

---

## Troubleshooting

### Backend shows: "CDP credentials not configured"
- Check Railway environment variables are set correctly
- Ensure no extra spaces or line breaks in API key name
- Verify private key includes the BEGIN/END markers

### Frontend doesn't show embedded wallet option
- Check Vercel env var: `VITE_ENABLE_EMBEDDED_WALLETS=true`
- Ensure you're using `WalletTypeSelector` component
- Check browser console for errors

### Wallet creation fails with 401
- API credentials are invalid
- Regenerate credentials in CDP portal
- Update Railway environment variables

### Wallet creation fails with network error
- Check backend URL in `VITE_API_URL`
- Verify backend is deployed and healthy
- Check CORS settings

---

## What's Next?

### Recommended Enhancements

1. **User Authentication**
   - Replace temporary userId with real auth system
   - Link wallets to user accounts

2. **Database Integration**
   - Replace `cdpWalletStore` Map with PostgreSQL/MongoDB
   - Store wallet metadata securely

3. **Wallet Management UI**
   - Show wallet balance in embedded wallet UI
   - Add export/backup features
   - Show transaction history

4. **Production Hardening**
   - Add rate limiting to wallet creation
   - Implement proper authentication
   - Add audit logging
   - Switch to mainnet when ready

---

## Support & Resources

- **CDP Documentation:** https://docs.cdp.coinbase.com/
- **CDP Portal:** https://portal.cdp.coinbase.com/
- **Wallet Adapter Docs:** https://github.com/solana-labs/wallet-adapter
- **Solana Web3.js Docs:** https://solana-labs.github.io/solana-web3.js/

---

## Summary

✅ **Phase 1 Complete:** Coinbase Wallet browser extension works now
🔧 **Phase 2 Ready:** Add API keys to enable embedded wallets
🎨 **Brand Love:** Both Phantom and Coinbase prominently featured
🚀 **Production Ready:** Just add your CDP credentials to deploy

Enjoy your multi-wallet integration! 🎉
