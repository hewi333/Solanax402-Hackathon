# Quick Start Guide - x402 Learn & Earn

Get the x402 Learn & Earn platform running in under 10 minutes.

---

## 🚀 5-Minute Setup

### Step 1: Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18+** installed ([nodejs.org](https://nodejs.org))
- ✅ **Phantom Wallet** browser extension ([phantom.app](https://phantom.app))
- ✅ **Git** installed

**Check your Node version:**
```bash
node --version  # Should be v18.0.0 or higher
```

---

### Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/heyhewi/Solanax402-Hackathon.git
cd Solanax402-Hackathon

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

**Expected time:** 2-3 minutes (depending on internet speed)

---

### Step 3: Generate Treasury Wallet

The treasury wallet is used to pay out rewards to learners.

```bash
# Navigate to backend
cd backend

# Generate a new wallet
node generate-treasury-wallet.js

# You'll see output like this:
# 🔑 Treasury Wallet Generated!
# Public Key: <YOUR_PUBLIC_KEY>
# Base58 Private Key: <YOUR_PRIVATE_KEY>
```

**IMPORTANT:** Save both keys! You'll need them in the next step.

---

### Step 4: Configure Environment Variables

#### Backend Configuration

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add:

```env
PORT=3001
NODE_ENV=development
TREASURY_WALLET_KEYPAIR=<paste-base58-private-key-here>
SOLANA_NETWORK=devnet
MAX_REWARD_AMOUNT=0.5
```

Replace `<paste-base58-private-key-here>` with the Base58 private key from Step 3.

#### Frontend Configuration

Create frontend `.env`:

```bash
cd ..  # Back to root directory
cp .env.example .env
```

Edit `.env` and add:

```env
VITE_API_URL=http://localhost:3001
VITE_TREASURY_WALLET=<paste-public-key-here>
VITE_SOLANA_RPC_HOST=https://api.devnet.solana.com
```

Replace `<paste-public-key-here>` with the public key from Step 3.

---

### Step 5: Fund the Treasury Wallet

Your treasury wallet needs devnet SOL to pay out rewards.

1. **Copy your treasury wallet public key** (from Step 3)
2. **Go to:** [solfaucet.com](https://solfaucet.com)
3. **Paste** your public key
4. **Click "Airdrop"** - You'll receive 1 SOL

**Repeat 2-3 times** to get enough SOL for testing (each session pays out 0.5 SOL maximum).

**Verify balance:**
```bash
# Check on Solana Explorer
# https://explorer.solana.com/address/<YOUR_PUBLIC_KEY>?cluster=devnet
```

---

### Step 6: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start

# You should see:
# 🚀 x402 AI Agent Backend running on http://localhost:3001
# ✅ Treasury wallet loaded: <YOUR_PUBLIC_KEY>
# 📊 Health check: http://localhost:3001/api/health
```

**Terminal 2 - Frontend:**
```bash
# Open a new terminal in project root
npm run dev

# You should see:
# VITE v7.x.x ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

**Keep both terminals running!**

---

### Step 7: Configure Phantom Wallet

1. **Open Phantom wallet** extension
2. **Click** the gear icon (Settings)
3. **Go to:** Developer Settings
4. **Enable** "Testnet Mode"
5. **Select** "Devnet" from the network dropdown

**Get test SOL for your personal wallet:**
- Click your address to copy it
- Go to [solfaucet.com](https://solfaucet.com)
- Paste and click "Airdrop"
- You'll receive 1 SOL

---

### Step 8: Test the Application

1. **Open browser** to [http://localhost:5173](http://localhost:5173)

2. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select "Phantom"
   - Approve the connection

3. **Verify Balance**
   - You should see your devnet SOL balance
   - If 0, use the "Get Test SOL" button or visit faucet

4. **Pay to Start**
   - Click "Pay 0.05 SOL to Start"
   - Approve the transaction in Phantom
   - Wait for confirmation (~1 second)

5. **Answer Questions**
   - Read Module 1 content
   - Type your answer in your own words
   - Submit

6. **Earn Rewards**
   - Correct answer earns 0.1 SOL
   - Watch the celebration modal
   - See progress bar update
   - Check your wallet balance increase

7. **Complete All Modules**
   - Answer all 5 questions correctly
   - Earn 0.5 SOL total (break even!)
   - Session automatically closes
   - "Start New Session" button appears

---

## ✅ Success Checklist

If everything is working, you should see:

- [x] Backend running on port 3001
- [x] Frontend running on port 5173
- [x] Phantom wallet connected (Devnet mode)
- [x] Payment gate allows 0.05 SOL payment
- [x] Chat interface appears after payment
- [x] Questions can be answered
- [x] Correct answers trigger 0.01 SOL rewards
- [x] Progress bar shows earnings
- [x] Session closes at 0.05 SOL earned
- [x] Transactions visible on [Solana Explorer](https://explorer.solana.com?cluster=devnet)

---

## 🔍 Troubleshooting

### "Cannot connect to backend"

**Problem:** Frontend can't reach the backend API.

**Solutions:**
1. Verify backend is running (Terminal 1)
2. Check port 3001 is not in use
3. Ensure `VITE_API_URL` in `.env` is `http://localhost:3001`
4. Restart both servers

**Test backend directly:**
```bash
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","treasuryWallet":"<YOUR_PUBLIC_KEY>","network":"devnet"}
```

---

### "Treasury wallet not configured"

**Problem:** Backend can't load the treasury wallet.

**Solutions:**
1. Verify `backend/.env` has `TREASURY_WALLET_KEYPAIR`
2. Ensure it's the **Base58 private key** (not JSON array)
3. No extra spaces or quotes
4. Restart backend server

**Check your env:**
```bash
cd backend
cat .env | grep TREASURY_WALLET_KEYPAIR

# Should show: TREASURY_WALLET_KEYPAIR=<long-base58-string>
```

---

### "Insufficient funds in treasury"

**Problem:** Treasury wallet ran out of SOL.

**Solutions:**
1. Check treasury balance on [Solana Explorer](https://explorer.solana.com?cluster=devnet)
2. Visit [solfaucet.com](https://solfaucet.com) with treasury public key
3. Airdrop more devnet SOL
4. Each session can pay out max 0.5 SOL, plan accordingly

**Quick fix:**
```bash
# Get your treasury public key
grep VITE_TREASURY_WALLET .env

# Visit faucet with that address
# Airdrop 1 SOL (repeat as needed)
```

---

### "Wallet won't connect"

**Problem:** Phantom wallet connection fails.

**Solutions:**
1. Verify Phantom extension is installed
2. Switch Phantom to **Devnet** mode
3. Refresh the page
4. Try disconnecting and reconnecting
5. Check browser console for errors

**Verify Phantom settings:**
- Settings → Developer Settings → Testnet Mode: ON
- Network dropdown: Devnet selected

---

### "Payment transaction fails"

**Problem:** Cannot complete 0.5 SOL payment.

**Solutions:**
1. Check your personal wallet has ≥0.5 SOL
2. Use faucet to get more devnet SOL
3. Verify Phantom is on Devnet (not mainnet!)
4. Check console for specific error
5. Try refreshing and reconnecting wallet

---

### "Reward not received"

**Problem:** Answered correctly but didn't get 0.01 SOL.

**Solutions:**
1. Check backend terminal for errors
2. Verify treasury wallet has funds
3. Look for transaction signature in UI
4. Search signature on [Solana Explorer](https://explorer.solana.com?cluster=devnet)
5. Check backend logs for payment errors

**Debug reward system:**
```bash
# In backend terminal, watch for:
# ✅ Reward sent: <signature>
# Or error messages
```

---

### "Progress bar not updating"

**Problem:** Answered questions but progress bar stuck.

**Solutions:**
1. Check browser console for errors
2. Verify ChatInterface state is updating
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check React DevTools for state changes

---

### Build errors

**Problem:** `npm install` or `npm run dev` fails.

**Solutions:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Ensure Node.js version is 18+
4. Check for EACCESS errors (permissions)
5. Try `npm cache clean --force`

**Clean install:**
```bash
rm -rf node_modules package-lock.json
npm install

cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 🧪 Quick Test Scenarios

### Test 1: Happy Path (Full Flow)

1. Connect wallet ✅
2. Pay 0.05 SOL ✅
3. Answer Module 1 correctly ✅
4. Receive 0.01 SOL reward ✅
5. Progress bar shows 0.01/0.05 ✅
6. Repeat for modules 2-5 ✅
7. Session completes at 0.05 SOL ✅
8. "Start New Session" appears ✅

**Expected time:** 5-10 minutes

---

### Test 2: Wrong Answer Flow

1. Connect wallet ✅
2. Pay 0.05 SOL ✅
3. Answer Module 1 **incorrectly** ✅
4. See hint appear ✅
5. Try again with better answer ✅
6. Get reward on correct answer ✅

**Verifies:** Hint system works

---

### Test 3: Session Reset

1. Complete full session (earn 0.05 SOL) ✅
2. Click "Start New Session" ✅
3. Payment gate appears again ✅
4. Pay another 0.05 SOL ✅
5. Modules restart from beginning ✅

**Verifies:** Closed-loop economy works

---

## 📊 System Health Check

### Backend Health Endpoint

Visit: [http://localhost:3001/api/health](http://localhost:3001/api/health)

**Expected response:**
```json
{
  "status": "ok",
  "treasuryWallet": "<YOUR_PUBLIC_KEY>",
  "network": "devnet",
  "maxRewardAmount": 0.5
}
```

**If `status: "error"`** - check backend logs for issues.

---

### Frontend Status

Indicators that frontend is healthy:

- ✅ Page loads without errors
- ✅ "Connect Wallet" button visible
- ✅ No console errors (check DevTools)
- ✅ Solana gradient theme visible
- ✅ "Built with ❤️ for Solana x402 Hackathon" in footer

---

### Wallet Status

Check your Phantom wallet:

- ✅ Connected to Devnet
- ✅ Balance shows in SOL (not USD when on Devnet)
- ✅ Recent transactions visible
- ✅ Can see pending transactions

---

## 🎯 What to Demonstrate

For hackathon judges, show:

1. **Payment Gate** - 0.05 SOL entry fee
2. **AI Evaluation** - Answer gets evaluated automatically
3. **Autonomous Rewards** - 0.01 SOL sent without human approval
4. **Session Closure** - Stops at 0.05 SOL earned
5. **Closed Loop** - Can restart with new payment
6. **On-Chain Verification** - Transactions on Solana Explorer

---

## 🆘 Still Having Issues?

### Check File Structure

```bash
# Verify structure
ls -la

# Should see:
# - src/
# - backend/
# - node_modules/
# - package.json
# - .env
# - backend/.env
```

### Check Environment Variables

```bash
# Frontend
cat .env

# Backend
cat backend/.env
```

### Restart Everything

```bash
# Kill all processes
# Ctrl+C in both terminals

# Terminal 1
cd backend
npm start

# Terminal 2
npm run dev
```

### Clear Browser Cache

- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

---

## 📞 Getting Help

If you're still stuck:

1. **Check GitHub Issues:** [github.com/heyhewi/Solanax402-Hackathon/issues](https://github.com/heyhewi/Solanax402-Hackathon/issues)
2. **Read Documentation:** See [README.md](README.md) and [backend/README.md](backend/README.md)
3. **Check Logs:** Look for specific error messages in terminal
4. **Solana Explorer:** Verify transactions at [explorer.solana.com](https://explorer.solana.com?cluster=devnet)

---

## 🎉 You're Ready!

If you've completed all steps successfully:

✅ Backend is running and healthy
✅ Frontend is accessible
✅ Treasury wallet is funded
✅ Phantom wallet is connected (Devnet)
✅ You can pay, answer, and earn rewards

**Next steps:**
- Test all 5 modules
- Try wrong answers to see hints
- Complete a full session
- Test the "Start New Session" flow
- Verify transactions on Solana Explorer

---

## 📚 Additional Resources

- **Full Documentation:** [README.md](README.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Backend API:** [backend/README.md](backend/README.md)
- **Solana Docs:** [docs.solana.com](https://docs.solana.com)
- **Phantom Wallet:** [phantom.app/help](https://phantom.app/help)

---

**Happy Learning! 🚀**

*If you find this useful, please ⭐ star the repo on GitHub!*

---

*Last updated: November 6, 2025*
