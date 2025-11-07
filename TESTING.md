# Testing Strategy for Solana x402 Learn & Earn Platform

## Overview

This document outlines the testing strategy for the Solana x402 hackathon project, with a focus on avoiding faucet rate limits and enabling rapid iteration during development.

---

## Payment Amount Configuration

**Current Settings (Optimized for Testing):**
- Entry Payment: **0.05 SOL** (down from 0.5 SOL)
- Reward per Module: **0.01 SOL** (down from 0.1 SOL)
- Total Rewards: **5 modules × 0.01 SOL = 0.05 SOL**

**Benefits:**
- 10x cheaper testing (0.05 SOL vs 0.5 SOL per test cycle)
- 1 SOL from faucet = 20 complete test cycles
- Treasury wallet funds last much longer
- Same payment flow validation with minimal cost

---

## Wallet Types & Testing Approach

### 1. External Wallet (Phantom, Coinbase Extension)

**Use For:**
- Primary development workflow
- Payment flow testing
- Reward distribution testing
- Integration testing

**Setup:**
1. Install Phantom wallet extension
2. Switch to Solana Devnet in wallet settings
3. Fund via devnet faucet: https://faucet.solana.com/ (or use backend `/api/faucet` endpoint)
4. Connect wallet in app

**Advantages:**
- No rate limiting (reuse same wallet)
- Fast iteration
- Easy to manually fund from other wallets
- Full control over private keys

**Testing Flow:**
```bash
# 1. Get initial devnet SOL
curl -X POST http://localhost:3001/api/faucet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "YOUR_PHANTOM_ADDRESS"}'

# 2. Test payment flow (0.05 SOL)
# 3. Complete 5 modules (earn back 0.05 SOL)
# 4. Repeat as needed
```

---

### 2. Embedded Wallet (Coinbase CDP)

**Use For:**
- Final integration testing
- Hackathon demo validation
- E2E user experience testing

**Setup:**
1. Configure CDP API credentials in backend `.env`:
   ```env
   CDP_API_KEY_ID=your_api_key_id
   CDP_API_KEY_SECRET=your_api_key_secret
   ```
2. Click "Create Embedded Wallet" in app
3. Auto-funded with 1 SOL from devnet faucet

**Limitations:**
- Faucet rate limit: ~10-15 wallets per hour (IP-based)
- New wallet on each creation (unique user ID)
- Cannot easily transfer SOL to CDP wallet manually

**Testing Strategy:**
- ✅ **Wallet Reuse:** Store CDP user ID and reuse wallet across deployments
- ✅ **Limited Testing:** Only test embedded wallet flow once before final submission
- ✅ **Mock for Development:** Use external wallet for feature development

---

## Testing Workflow by Phase

### Phase 1: Feature Development (Daily Work)

**Goal:** Rapid iteration without faucet concerns

**Wallet Type:** External Wallet (Phantom)

**Process:**
1. Use single Phantom wallet throughout development
2. Fund once with 2-3 SOL from faucet
3. Test payment flows repeatedly (0.05 SOL each)
4. Manually refund wallet from treasury if needed

**Commands:**
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd learnearn && npm run dev

# Test payment flow
# (Use Phantom wallet in browser)
```

---

### Phase 2: Integration Testing (Pre-Deployment)

**Goal:** Validate both wallet types work correctly

**Test Cases:**

#### Test Case 1: External Wallet Flow
- [ ] Connect Phantom wallet
- [ ] Verify auto-connect priority works
- [ ] Request faucet (if balance < 0.05 SOL)
- [ ] Pay 0.05 SOL to unlock platform
- [ ] Verify BigInt conversion works (no errors)
- [ ] Complete 5 learning modules
- [ ] Verify 5 × 0.01 SOL rewards received
- [ ] Verify total balance updated correctly

#### Test Case 2: Embedded Wallet Flow
- [ ] Create new embedded wallet (or reuse existing)
- [ ] Verify auto-funded with 1 SOL
- [ ] Pay 0.05 SOL to unlock platform
- [ ] Verify CDP payment API works
- [ ] Complete 5 learning modules
- [ ] Verify rewards sent to embedded wallet
- [ ] Verify balance updates correctly

#### Test Case 3: Wallet Switching
- [ ] Connect Phantom wallet
- [ ] Verify embedded wallet button hidden
- [ ] Click "Switch Wallet"
- [ ] Verify Phantom disconnected
- [ ] Create/connect embedded wallet
- [ ] Verify Phantom button hidden
- [ ] Click "Switch Wallet"
- [ ] Verify embedded wallet cleared

#### Test Case 4: Auto-Connect Priority
- [ ] Clear localStorage
- [ ] Disconnect all wallets
- [ ] Create embedded wallet (stored in localStorage)
- [ ] Refresh page
- [ ] Connect Phantom wallet extension
- [ ] Verify Phantom takes priority (external > embedded)
- [ ] Verify only Phantom wallet is active

---

### Phase 3: Final Validation (Pre-Submission)

**Goal:** Full E2E testing in production-like environment

**Environment:** Deployed frontend (Vercel) + backend (Railway)

**Test Cases:**
- [ ] Fresh embedded wallet creation on production
- [ ] External wallet connection on production
- [ ] Payment flow on production
- [ ] Reward distribution on production
- [ ] Session completion and reset

---

## Embedded Wallet Reuse Strategy

### Problem
Every new embedded wallet requires faucet funding (1 SOL), leading to rate limits after ~5 wallets.

### Solution: Wallet Persistence

**Current Implementation:**
- User ID stored in localStorage: `cdp_user_id`
- Wallet address stored: `cdp_wallet_address`
- Wallet auto-loads on page refresh

**For Testing:**
1. **Create wallet once:**
   ```javascript
   // First test: Create embedded wallet
   localStorage.getItem('cdp_user_id') // e.g., "user_1234567890_abc123"
   ```

2. **Reuse across deployments:**
   ```javascript
   // Copy user ID and address from browser console
   // Re-use same values in subsequent tests
   localStorage.setItem('cdp_user_id', 'user_1234567890_abc123')
   localStorage.setItem('cdp_wallet_address', 'ABC123...')
   ```

3. **Backend persists wallet data:**
   - CDP wallets stored in `cdpWalletStore` Map (in-memory)
   - On Railway deployment restart, wallets are lost
   - **Workaround:** Backend checks if wallet exists before creating new one

**Future Enhancement:**
```javascript
// .env.local (for development)
VITE_TEST_CDP_USER_ID=test-user-fixed-id
VITE_DEV_MODE=true

// Use fixed test user ID to reuse same wallet
const userId = import.meta.env.VITE_TEST_CDP_USER_ID || generateUserId()
```

---

## Rate Limit Mitigation

### Faucet Limits
- **Solana Devnet Faucet:** ~10-15 airdrops per hour per IP
- **Limit Type:** IP-based (not wallet-based)
- **Workaround:** VPN rotation (not recommended for hackathon)

### Best Practices

#### 1. Reuse Wallets
✅ **Do:** Use same Phantom wallet for all development
❌ **Don't:** Create new embedded wallet on every test

#### 2. Manual Funding
✅ **Do:** Transfer SOL between wallets manually
❌ **Don't:** Request faucet for every small amount

Example:
```bash
# Transfer from Phantom to another wallet (using Phantom UI)
# Or use Solana CLI:
solana transfer <recipient-address> 0.5 --allow-unfunded-recipient
```

#### 3. Treasury Wallet Funding
✅ **Do:** Use treasury wallet to fund test wallets
❌ **Don't:** Rely solely on faucet

Backend endpoint (development only):
```javascript
// POST /api/test-fund
{
  "walletAddress": "ABC123...",
  "amount": 1.0
}
```

#### 4. Small Payment Amounts
✅ **Do:** Use 0.05 SOL for testing (current setting)
❌ **Don't:** Use 0.5 SOL unless testing full user flow

---

## Testing Checklist

### Before Each Test Cycle
- [ ] Verify backend is running (Railway or localhost)
- [ ] Verify frontend is running (Vercel or localhost)
- [ ] Check wallet balance (≥ 0.05 SOL)
- [ ] Clear browser console for fresh logs
- [ ] Check network is Solana Devnet

### After Each Test Cycle
- [ ] Verify payment transaction succeeded
- [ ] Check transaction on Solana Explorer (devnet)
- [ ] Verify rewards received
- [ ] Check console for errors
- [ ] Document any issues

### Before Deployment
- [ ] Test external wallet flow (end-to-end)
- [ ] Test embedded wallet flow (end-to-end)
- [ ] Test wallet switching
- [ ] Test auto-connect behavior
- [ ] Verify all transactions on Solana Explorer
- [ ] Check for console errors
- [ ] Test on mobile (if applicable)

---

## Multiple Wallet Types Appearing

**Question:** "Why do I see Backpack, Solflare, MetaMask, Brave, and other wallets I didn't install?"

**Answer:** This is normal and expected behavior! The Solana wallet adapter automatically detects ALL wallet extensions you have installed in your browser.

**How it Works:**
- The wallet adapter scans for installed browser extensions
- It shows detected wallets even if you primarily use Phantom
- This gives you flexibility to choose which wallet to use

**What You See:**
- **Detected:** Backpack, Solflare, MetaMask (if installed)
- **More Options:** Coinbase Wallet extension
- **Always Available:** Phantom, Coinbase CDP embedded wallet

**For Testing:**
- ✅ **Use Phantom** for main development testing
- ✅ **Ignore other wallets** if you're not using them
- ✅ **Test with Coinbase CDP** for embedded wallet flow

**Why This is Good:**
- Users with multiple wallets can choose their preferred one
- No need to uninstall other extensions
- Standard Solana ecosystem behavior

---

## Troubleshooting

### Issue: "Payment failed. The number 0.5 cannot be converted to a Bigint"
**Status:** ✅ **FIXED** in App.jsx:113
**Solution:** Added `Math.floor()` to lamports conversion

### Issue: Both wallet buttons showing at same time
**Status:** ✅ **FIXED** with `activeWalletType` state
**Solution:** Exclusive wallet selection implemented

### Issue: Faucet rate limit exceeded
**Solutions:**
1. Use existing Phantom wallet (no new faucet request)
2. Reuse embedded wallet from localStorage
3. Manual transfer from funded wallet
4. Use treasury wallet for development funding

### Issue: Embedded wallet not persisting across refreshes
**Check:**
```javascript
localStorage.getItem('cdp_user_id') // Should exist
localStorage.getItem('cdp_wallet_address') // Should exist
```
**Solution:** EmbeddedWalletButton auto-loads from localStorage on mount

### Issue: External wallet takes priority over embedded wallet
**Status:** ✅ **Working as Intended**
**Explanation:** Auto-connect priority is external > embedded (user preference)

---

## Environment Variables

### Frontend (.env.local)
```env
VITE_TREASURY_WALLET=<your-treasury-wallet-address>
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```env
# Solana
SOLANA_NETWORK=devnet
TREASURY_WALLET_PRIVATE_KEY=<base58-encoded-private-key>

# Coinbase CDP
CDP_API_KEY_ID=<your-api-key-id>
CDP_API_KEY_SECRET=<your-api-key-secret>

# OpenAI (for chatbot)
OPENAI_API_KEY=<your-openai-api-key>
```

---

## Quick Reference

### Useful Commands
```bash
# Check Solana devnet balance
solana balance <address> --url devnet

# Request faucet via CLI
solana airdrop 1 <address> --url devnet

# View transaction details
# Visit: https://explorer.solana.com/tx/<signature>?cluster=devnet

# Clear localStorage (reset wallets)
localStorage.clear()
```

### Useful Links
- Solana Devnet Faucet: https://faucet.solana.com/
- Solana Explorer (Devnet): https://explorer.solana.com/?cluster=devnet
- Phantom Wallet: https://phantom.app/
- Coinbase CDP Docs: https://docs.cdp.coinbase.com/

---

## Summary

**For Daily Development:**
- Use Phantom wallet exclusively
- Fund once, reuse many times
- Test with 0.05 SOL payments

**For Integration Testing:**
- Create embedded wallet ONCE
- Store user ID and reuse
- Test both wallet types

**For Final Validation:**
- Fresh E2E test on production
- Test embedded wallet creation
- Verify all flows work

**Result:** Avoid faucet rate limits, test efficiently, ship confidently! 🚀
