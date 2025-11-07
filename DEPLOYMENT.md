# Deployment Guide - x402 Learn & Earn

Deploy the x402 Learn & Earn platform to production using a monorepo approach.

## Architecture Overview

```
Single Repository (Solanax402-Hackathon)
├── src/                → Deploy to Vercel (Frontend)
└── backend/            → Deploy to Railway/Render (Backend)
```

Both frontend and backend deploy from the same repository to different services.

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) ⭐ Recommended

This is the easiest setup for hackathons.

#### Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Click "New Project"**

3. **Import your GitHub repository**
   - Select: `heyhewi/Solanax402-Hackathon`

4. **Configure the project:**
   ```
   Framework Preset: Vite
   Root Directory: ./ (leave as root)
   Build Command: npm run build
   Output Directory: dist
   ```

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_TREASURY_WALLET=<your-treasury-public-key>
   VITE_SOLANA_RPC_HOST=https://api.devnet.solana.com
   ```

6. **Deploy!**

#### Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app) and sign in**

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select your repository: `heyhewi/Solanax402-Hackathon`**

4. **Configure the deployment:**
   ```
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables:**
   ```
   TREASURY_WALLET_KEYPAIR=<base58-encoded-private-key>
   SOLANA_NETWORK=devnet
   MAX_REWARD_AMOUNT=0.5
   PORT=3001
   NODE_ENV=production

   # Optional: For embedded wallets
   CDP_API_KEY_ID=<your-cdp-key-id>
   CDP_API_KEY_SECRET=<your-cdp-secret>
   CDP_WALLET_SECRET=<your-wallet-secret>
   ```

   **Note**: Generate treasury wallet using `node generate-treasury-wallet.js` locally, then add the Base58 private key here. See [CDP_SETUP.md](CDP_SETUP.md) for embedded wallet credentials.

6. **Generate a public domain:**
   - Railway will give you a URL like: `https://your-app.railway.app`

7. **Copy the Railway URL and update Vercel:**
   - Go back to Vercel
   - Settings → Environment Variables
   - Update `VITE_API_URL` to your Railway URL

8. **Redeploy the frontend** on Vercel to pick up the new API URL

### Option 2: Render (Both Frontend & Backend)

Deploy both to Render.com:

#### Backend on Render

1. **Go to [render.com](https://render.com)**

2. **New → Web Service**

3. **Connect your GitHub repo**

4. **Configure:**
   ```
   Name: financeai-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables:**
   ```
   TREASURY_WALLET_KEYPAIR=<base58-encoded-private-key>
   SOLANA_NETWORK=devnet
   MAX_REWARD_AMOUNT=0.5
   PORT=3001
   NODE_ENV=production
   ```

#### Frontend on Render

1. **New → Static Site**

2. **Connect same GitHub repo**

3. **Configure:**
   ```
   Name: x402-learn-earn-frontend
   Root Directory: ./ (root)
   Build Command: npm run build
   Publish Directory: dist
   ```

4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://x402-backend.onrender.com
   VITE_TREASURY_WALLET=<treasury-public-key>
   VITE_SOLANA_RPC_HOST=https://api.devnet.solana.com
   ```

### Option 3: All-in-One Platforms

#### Netlify Functions + Frontend

Convert the backend to Netlify Functions:
- More complex setup
- Good for simple APIs
- May require code refactoring

#### Vercel Serverless Functions + Frontend

Convert backend to Vercel API routes:
- Create `learnearn/api/` directory
- Move backend logic to serverless functions
- Good option but requires restructuring

## Production Checklist

### Security
- [ ] **Never commit .env files** (they're now in .gitignore)
- [ ] All API keys stored in deployment platform environment variables
- [ ] Backend CORS configured for your frontend domain only
- [ ] Rate limiting enabled on backend
- [ ] HTTPS enabled (automatic on Vercel/Railway/Render)

### Configuration
- [ ] Backend deployed and accessible
- [ ] Frontend `VITE_API_URL` points to production backend
- [ ] Treasury wallet keypair configured in backend
- [ ] Treasury wallet funded with devnet SOL
- [ ] All environment variables set correctly

### Testing
- [ ] Frontend loads without errors
- [ ] Wallet connection works (Phantom, Coinbase, or embedded)
- [ ] Payment gate accepts 0.05 SOL
- [ ] Learning modules load correctly
- [ ] AI evaluates answers
- [ ] Rewards distribute (0.01 SOL per module)
- [ ] Session completes after 0.05 SOL earned

### For Mainnet (Post-Hackathon)
- [ ] Change `VITE_SOLANA_NETWORK` to `mainnet-beta`
- [ ] Update RPC endpoint to mainnet
- [ ] Test with real SOL (small amounts first!)
- [ ] Implement actual SOL transfers
- [ ] Add wallet funding for rewards

## Environment Variables Reference

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
VITE_TREASURY_WALLET=<treasury-public-key>
VITE_SOLANA_RPC_HOST=https://api.devnet.solana.com
```

### Backend (.env)
```env
TREASURY_WALLET_KEYPAIR=<base58-encoded-private-key>
SOLANA_NETWORK=devnet
MAX_REWARD_AMOUNT=0.5
PORT=3001
NODE_ENV=production

# Optional: For Coinbase CDP embedded wallets
CDP_API_KEY_ID=<your-key-id>
CDP_API_KEY_SECRET=<your-secret>
CDP_WALLET_SECRET=<your-wallet-secret>
```

## Why Monorepo Works

**Benefits:**
- ✅ Single source of truth
- ✅ Easier version control
- ✅ Shared documentation
- ✅ Simpler dependency management
- ✅ Both services versioned together
- ✅ Single PR for full-stack changes

**When to separate:**
- Large teams with separate frontend/backend teams
- Very different deployment schedules
- Vastly different tech stacks requiring different CI/CD
- Microservices architecture with many services

For a hackathon project like this, **monorepo is perfect**! ✨

## Troubleshooting Deployment

### "Cannot connect to backend"

**Check:**
- Backend is deployed and running
- Backend URL is correct in frontend env vars
- CORS is enabled in backend
- Both services are using HTTPS

**Test backend directly:**
```bash
curl https://your-backend-url.com/api/health
```

Should return:
```json
{
  "status":"ok",
  "treasuryWallet":"<your-public-key>",
  "network":"devnet"
}
```

### "Treasury wallet not configured"

**Check:**
- Environment variable `TREASURY_WALLET_KEYPAIR` is set
- It contains the Base58-encoded private key (not JSON array)
- Backend has been redeployed after setting env var
- Treasury wallet is funded with devnet SOL

### "Frontend build fails"

**Common issues:**
- Missing environment variables
- Build command incorrect
- Wrong root directory
- Node version mismatch (use Node 18+)

**Fix:**
- Check deployment logs
- Verify all VITE_ env vars are set
- Test build locally: `npm run build`

### "CORS errors in browser"

**Backend needs CORS enabled:**

In `backend/server.js`, make sure you have:
```javascript
import cors from 'cors'

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))
```

For production, set `FRONTEND_URL` env var to your Vercel domain.

## Cost Estimates

### Free Tier Options:
- **Vercel**: Free for personal projects (100 GB bandwidth/month)
- **Railway**: $5 credit free, then ~$5-10/month
- **Render**: Free tier available (sleeps after 15 min inactivity)
- **OpenAI API**: Pay-per-use (~$0.002 per request with GPT-4)

### For Hackathon Demo:
- Total cost: **$0-5** (mostly OpenAI API usage)
- Vercel: Free
- Railway/Render: Free tier or $5
- OpenAI: ~$1-2 for testing

## Quick Deploy Script

Here's a summary of what to do:

```bash
# 1. Push your code to GitHub (already done!)
git push origin main

# 2. Generate treasury wallet locally
# cd backend && node generate-treasury-wallet.js
# Save the keys!

# 3. Deploy backend to Railway
# - Go to railway.app
# - New Project → Deploy from GitHub
# - Select repo, set root to "backend"
# - Add environment variables (treasury keypair, etc.)
# - Get the Railway URL

# 4. Deploy frontend to Vercel
# - Go to vercel.com
# - New Project → Import from GitHub
# - Select repo, set root to "./" (root)
# - Add VITE_API_URL with Railway URL
# - Add VITE_TREASURY_WALLET (public key)
# - Deploy!

# 5. Fund treasury wallet on devnet
# Visit solfaucet.com and airdrop SOL to treasury address

# 6. Test your live app!
```

## Support

Need help with deployment?
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Render Docs**: [render.com/docs](https://render.com/docs)

---

**Ready to deploy?** Follow the steps above and your x402 Learn & Earn platform will be live! 🚀

**Remember:** Deploy both frontend and backend from your monorepo - no separate repos needed! ✨
