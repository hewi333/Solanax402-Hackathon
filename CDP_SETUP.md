# Coinbase CDP Embedded Wallet Setup

This guide explains how to set up Coinbase CDP (Coinbase Developer Platform) embedded wallets for the x402 Learn & Earn platform. Embedded wallets allow users to create Solana wallets without installing browser extensions.

## What You Need

Three environment variables from Coinbase CDP:
- `CDP_API_KEY_ID` - Your API key identifier
- `CDP_API_KEY_SECRET` - Your API secret key
- `CDP_WALLET_SECRET` - Your wallet secret (optional but recommended)

## Getting Your CDP Credentials

### Step 1: Access CDP Portal

1. Visit [https://portal.cdp.coinbase.com/](https://portal.cdp.coinbase.com/)
2. Sign in or create a Coinbase Developer account
3. Create a new project or select an existing one

### Step 2: Create API Key

1. Navigate to **API Keys** section
2. Click **Create API Key**
3. You'll receive three values - **save them immediately** (they're only shown once!)
   - API Key ID
   - API Key Secret
   - Wallet Secret

**Important**: Download and save these credentials securely. You cannot retrieve them later.

## Railway Configuration (Backend)

### Add Environment Variables

1. Open your Railway project
2. Go to your backend service
3. Navigate to **Variables** tab
4. Add these three variables:

```bash
CDP_API_KEY_ID=your-api-key-id-here
CDP_API_KEY_SECRET=your-api-key-secret-here
CDP_WALLET_SECRET=your-wallet-secret-here
```

**Note**: Unlike CDP v1, you don't need the complex `organizations/.../apiKeys/...` format. Just use the simple key ID!

### Deploy

Railway will automatically redeploy your backend. Wait ~2 minutes for deployment to complete.

## Verifying Setup

### Check Backend Logs

After deployment, check your Railway logs for:

**Success:**
```
🏦 Coinbase CDP SDK v2 initialized successfully
API Key ID: abc12345...
```

**Not Configured:**
```
⚠️ CDP v2 credentials not configured.
Required environment variables:
  - CDP_API_KEY_ID
  - CDP_API_KEY_SECRET
  - CDP_WALLET_SECRET (optional but recommended)
```

### Test the Embedded Wallet Button

1. Open your deployed app
2. Click **"Create Embedded Wallet"** button
3. Backend creates a Solana account via CDP
4. You should see the wallet address displayed

## How It Works

When a user clicks "Create Embedded Wallet":

1. **Frontend** sends request to `/api/cdp/create-wallet`
2. **Backend** calls `cdpClient.solana.getOrCreateAccount()`
3. **CDP** creates a managed Solana wallet on devnet
4. **Response** includes the wallet's public address
5. **Frontend** displays address and wallet is ready to use

## Available API Endpoints

Your backend now has these CDP endpoints:

```
POST /api/cdp/create-wallet          # Create new embedded wallet
GET  /api/cdp/wallet/:userId          # Get wallet details
GET  /api/cdp/wallet/:userId/balance  # Get wallet balance
POST /api/cdp/export-wallet           # Export wallet (secure)
```

## Troubleshooting

### "CDP service not configured"

**Problem**: Environment variables not set correctly.

**Solution**:
- Verify all three variables are added to Railway
- Check for typos in variable names (must be exact)
- Ensure no extra spaces in values
- Redeploy backend after adding variables

### "Failed to initialize CDP SDK v2"

**Problem**: Invalid credentials or network error.

**Solution**:
- Verify credentials copied correctly from CDP portal
- Create new API key if original was lost
- Check Railway logs for specific error message
- Ensure CDP project is active in portal

### Wallet creation fails

**Problem**: Missing wallet secret or API permissions.

**Solution**:
- Verify `CDP_WALLET_SECRET` is set (required for signing)
- Check API key has wallet creation permissions
- Review Railway logs for detailed error
- Try creating new API key with full permissions

## Security Best Practices

- ✅ Never commit CDP credentials to git
- ✅ Use environment variables only (Railway/Vercel dashboards)
- ✅ Regenerate keys if accidentally exposed
- ✅ Enable API key restrictions in CDP portal (IP whitelist)
- ✅ Monitor API usage in CDP dashboard
- ⚠️ For production: Add rate limiting to wallet creation endpoint
- ⚠️ For production: Implement user authentication before wallet creation

## CDP v1 → v2 Migration

If you have old v1 credentials, here's what changed:

| CDP v1 (OLD) | CDP v2 (NEW) |
|--------------|--------------|
| `CDP_API_KEY_NAME=organizations/{org}/apiKeys/{key}` | `CDP_API_KEY_ID={simple-id}` |
| `CDP_API_KEY_PRIVATE_KEY=-----BEGIN EC...` | `CDP_API_KEY_SECRET={secret}` |
| 2 credentials | 3 credentials (added wallet secret) |
| Complex organization format | Simple key ID format |
| `Wallet.create()` | `cdpClient.solana.getOrCreateAccount()` |

**You cannot use v1 credentials with v2 code.** Create new API keys from the CDP portal.

## Optional: Frontend Configuration

If you want to customize the embedded wallet UI, add to Vercel:

```bash
VITE_ENABLE_EMBEDDED_WALLETS=true
VITE_CDP_PROJECT_ID=your-project-id
```

These control whether the embedded wallet button appears in your frontend.

## Resources

- **CDP Portal**: [https://portal.cdp.coinbase.com/](https://portal.cdp.coinbase.com/)
- **CDP Documentation**: [https://docs.cdp.coinbase.com/](https://docs.cdp.coinbase.com/)
- **Support**: Check CDP portal for API status and support options

---

**That's it!** Once configured, your app can create embedded Solana wallets for users without requiring browser extensions. This provides an alternative to Phantom wallet for users who prefer a managed wallet experience.
