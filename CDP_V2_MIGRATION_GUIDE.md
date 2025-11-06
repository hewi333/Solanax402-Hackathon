# CDP v2 Migration Complete! 🎉

## What Changed

Your application has been **migrated from CDP v1 to CDP v2 API** (Server Wallets v2).

---

## Before (v1 - OLD)

### SDK Package:
```json
"@coinbase/coinbase-sdk": "^0.25.0"
```

### Environment Variables:
```bash
CDP_API_KEY_NAME=organizations/8f1ac569.../apiKeys/87d98...
CDP_API_KEY_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----...
```

### Code:
```javascript
Coinbase.configure({...})
const wallet = await Wallet.create({...})
```

---

## After (v2 - NEW)

### SDK Package:
```json
"@coinbase/cdp-sdk": "latest"
```

### Environment Variables:
```bash
CDP_API_KEY_ID=your-key-id
CDP_API_KEY_SECRET=your-key-secret
CDP_WALLET_SECRET=your-wallet-secret
```

### Code:
```javascript
const cdpClient = new CdpClient({...})
const account = await cdpClient.solana.getOrCreateAccount({...})
```

---

## How to Set Up Your Railway Environment

### Step 1: Get Your CDP v2 Credentials

1. Go to https://portal.cdp.coinbase.com/
2. Navigate to your project
3. Click **"API Keys"** → **"Create API Key"**
4. You'll receive **three values**:
   - `API Key ID` (simple string)
   - `API Key Secret`
   - `Wallet Secret`

### Step 2: Add to Railway

In your Railway backend service, add these three environment variables:

```bash
CDP_API_KEY_ID=your-api-key-id-here
CDP_API_KEY_SECRET=your-api-key-secret-here
CDP_WALLET_SECRET=your-wallet-secret-here
```

**Important Notes:**
- ✅ **No more "organizations/..." path needed!**
- ✅ Simple, straightforward key IDs
- ✅ Three separate credentials for better security
- ✅ Works with personal CDP accounts

### Step 3: Deploy

Railway will automatically redeploy. Wait ~2 minutes.

### Step 4: Verify

Check Railway logs for:
```
🏦 Coinbase CDP SDK v2 initialized successfully
API Key ID: abc12345...
```

---

## What to Expect

### When Configured Correctly:
```
🏦 Coinbase CDP SDK v2 initialized successfully
API Key ID: abc12345...
```

### When Not Configured:
```
⚠️ CDP v2 credentials not configured.
Required environment variables:
  - CDP_API_KEY_ID: Your CDP API key ID
  - CDP_API_KEY_SECRET: Your CDP API key secret
  - CDP_WALLET_SECRET: Your wallet secret (optional but recommended)
```

---

## Testing the Embedded Wallet Button

1. **Open your app** after Railway deploys
2. **Click "Create Embedded Wallet"** button
3. **Backend will:**
   - Create a Solana account using `cdpClient.solana.getOrCreateAccount()`
   - Return the Solana address
   - Display it in the UI

4. **You should see:**
   ```
   🏦 Creating CDP v2 account for user: user_...
   Creating Solana account with name: user_...
   Account created/retrieved successfully
   Solana address: ABC123...xyz789
   ✅ CDP v2 account created successfully: ABC123...xyz789
   ```

---

## Key Differences: v1 vs v2

| Feature | v1 (OLD) | v2 (NEW) |
|---------|----------|----------|
| **SDK Package** | `@coinbase/coinbase-sdk` | `@coinbase/cdp-sdk` |
| **API Key Format** | `organizations/{org}/apiKeys/{key}` | Simple `API_KEY_ID` |
| **Number of Secrets** | 2 (name + private key) | 3 (ID + secret + wallet secret) |
| **Client Init** | `Coinbase.configure()` | `new CdpClient()` |
| **Create Wallet** | `Wallet.create()` | `cdpClient.solana.getOrCreateAccount()` |
| **Returns** | Wallet object | Account object with address |
| **Personal Accounts** | ❌ Requires org format | ✅ Works directly |

---

## Advantages of v2

1. **✅ Simpler Key Format** - No confusing organization paths
2. **✅ Personal Account Support** - Works with personal CDP accounts
3. **✅ Better Security** - Separate wallet secret for signing
4. **✅ Modern API** - Latest Coinbase CDP features
5. **✅ Named Accounts** - Can create/retrieve accounts by name
6. **✅ Auto-recovery** - `getOrCreateAccount` reuses existing accounts

---

## Troubleshooting

### Error: "CDP service not configured"
**Solution:** Add all three environment variables to Railway:
- `CDP_API_KEY_ID`
- `CDP_API_KEY_SECRET`
- `CDP_WALLET_SECRET`

### Error: "Failed to initialize CDP SDK v2"
**Solution:** Check Railway logs for specific error. Verify:
- All three variables are set
- No extra spaces in values
- Values are correct from CDP portal

### Wallet creation fails
**Solution:** Check:
- `CDP_WALLET_SECRET` is set (required for signing)
- Railway backend has redeployed
- Check Railway logs for detailed error messages

---

## Next Steps

1. ✅ **Add your three CDP v2 credentials to Railway**
2. ✅ **Wait for Railway to redeploy**
3. ✅ **Test the embedded wallet button**
4. ✅ **Check Railway logs for success messages**
5. 🎉 **Enjoy your working embedded wallets!**

---

## Support

If you encounter issues:
1. Check Railway logs for error messages
2. Verify all three environment variables are set
3. Ensure you're using CDP v2 credentials (not v1)
4. Double-check no typos in variable names

The migration is complete! Your app now uses the modern CDP v2 API. 🚀
