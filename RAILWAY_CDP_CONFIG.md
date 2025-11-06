# Railway CDP Configuration Fix

## Problem
You're getting "CDP service not configured" because your Railway environment variables use the old v1 format names, but the code expects v2 format names.

## Solution: Update Railway Environment Variables

### Current Variables (OLD v1 format - won't work):
```
CDP_API_KEY_NAME=...
CDP_API_KEY_PRIVATE_KEY=...
```

### Required Variables (NEW v2 format - required):
```
CDP_API_KEY_ID=<same value as CDP_API_KEY_NAME>
CDP_API_KEY_SECRET=<same value as CDP_API_KEY_PRIVATE_KEY>
```

## Step-by-Step Fix in Railway

1. **Go to your Railway project** → Backend service → Variables tab

2. **Add/Update these variables:**
   - Variable name: `CDP_API_KEY_ID`
   - Value: Copy the value from your `CDP_API_KEY_NAME` (it's the same thing, just renamed)

   - Variable name: `CDP_API_KEY_SECRET`
   - Value: Copy the value from your `CDP_API_KEY_PRIVATE_KEY` (it's the same thing, just renamed)

3. **Optional: You can delete the old variables** (or keep them, they won't hurt):
   - `CDP_API_KEY_NAME` (no longer used)
   - `CDP_API_KEY_PRIVATE_KEY` (no longer used)

4. **For CDP_WALLET_SECRET** - Try WITHOUT it first:
   - Leave it blank for now
   - If wallet creation works, great!
   - If you get an error about needing it, add it as a random string:
     ```
     CDP_WALLET_SECRET=my_random_secret_string_123456789
     ```
   - This is NOT from CDP portal - you make this up yourself
   - It's used to encrypt wallet data locally

5. **Redeploy** your Railway backend

## Testing After Fix

1. Visit your deployed app
2. Click "Create Embedded Wallet" (Coinbase CDP button)
3. You should see:
   - ✅ "Embedded wallet created and funded successfully!"
   - Wallet should have 1 SOL balance
   - You can then click "Pay 0.5 SOL to Start"

## Your Complete Railway Variables Should Be:

```
# AI & Core
OPENAI_API_KEY=sk-...

# Treasury (your existing wallet for sending rewards)
TREASURY_WALLET_KEYPAIR=[1,2,3...] or base58_string
VITE_TREASURY_WALLET=your_treasury_public_key

# CDP v2 (for embedded wallets)
CDP_API_KEY_ID=your_api_key_id
CDP_API_KEY_SECRET=your_api_key_secret
CDP_WALLET_SECRET=  # Optional - try without it first
```

## Why This Happened

When we migrated from CDP v1 SDK to CDP v2 SDK, the environment variable names changed:
- v1 used `CDP_API_KEY_NAME`
- v2 uses `CDP_API_KEY_ID`

Same credentials, different names!

---

**TL;DR:** Just rename `CDP_API_KEY_NAME` → `CDP_API_KEY_ID` and `CDP_API_KEY_PRIVATE_KEY` → `CDP_API_KEY_SECRET` in Railway, then redeploy.
