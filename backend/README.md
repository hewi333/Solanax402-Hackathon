# Backend API - x402 Learn & Earn Platform

This is the backend server for the Solana x402 Learn & Earn platform. It handles AI-powered learning, autonomous reward distribution, and payment verification on Solana.

## Overview

The backend provides a REST API that powers three critical x402 hackathon features:

1. **AI-Powered Learning** - Evaluates student answers and provides hints
2. **Autonomous Payments** - Controls treasury wallet and distributes SOL rewards
3. **Wallet Services** - Manages embedded wallets via Coinbase CDP

## Key Features

### 1. Autonomous AI Agent
- Evaluates learning module answers using keyword matching
- Provides progressive hints for incorrect answers
- Decides when to trigger reward payments (no human approval)
- Session state management

### 2. Treasury Wallet Management
- Holds SOL for autonomous reward distribution
- Executes Solana transactions automatically
- Pays 0.01 SOL per correct answer
- Tracks total rewards per session (max 0.03 SOL)

### 3. Coinbase CDP Integration
- Creates embedded Solana wallets (no browser extension needed)
- Auto-funds new wallets from devnet faucet
- Manages wallet state and balances
- Alternative to Phantom/Coinbase extension wallets

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and configuration.

**Response:**
```json
{
  "status": "ok",
  "treasuryWallet": "ABC123...",
  "network": "devnet",
  "maxRewardAmount": 0.5
}
```

### Chat & Learning
```
POST /api/chat
```
Processes student answers and triggers rewards.

**Request:**
```json
{
  "message": "AI agents use smart contracts to execute payments",
  "context": {
    "currentModule": 2,
    "walletAddress": "ABC123...",
    "totalEarned": 0.01
  }
}
```

**Response:**
```json
{
  "message": "Correct! Great answer.",
  "isCorrect": true,
  "rewardAmount": 0.01,
  "signature": "5x8...",
  "totalEarned": 0.02
}
```

### Reward Distribution
```
POST /api/reward
```
Sends SOL rewards to learner's wallet.

**Request:**
```json
{
  "walletAddress": "ABC123...",
  "amount": 0.01
}
```

**Response:**
```json
{
  "success": true,
  "signature": "5x8Zy...",
  "amount": 0.01,
  "explorerUrl": "https://explorer.solana.com/tx/5x8...?cluster=devnet"
}
```

### Devnet Faucet
```
POST /api/faucet
```
Airdrops devnet SOL for testing.

**Request:**
```json
{
  "walletAddress": "ABC123..."
}
```

**Response:**
```json
{
  "success": true,
  "signature": "5x8...",
  "amount": 1.0
}
```

### Coinbase CDP Endpoints

#### Create Embedded Wallet
```
POST /api/cdp/create-wallet
```

**Response:**
```json
{
  "userId": "user_123",
  "walletAddress": "ABC123...",
  "network": "solana-devnet"
}
```

#### Get Wallet Details
```
GET /api/cdp/wallet/:userId
```

#### Get Wallet Balance
```
GET /api/cdp/wallet/:userId/balance
```

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Treasury Wallet

```bash
node generate-treasury-wallet.js
```

**Important:** Save both the public key and Base58-encoded private key!

### 3. Configure Environment Variables

Create `.env`:

```env
# Solana Configuration
TREASURY_WALLET_KEYPAIR=<base58-encoded-private-key>
SOLANA_NETWORK=devnet
MAX_REWARD_AMOUNT=0.5

# Server Configuration
PORT=3001
NODE_ENV=development

# Coinbase CDP (Optional - for embedded wallets)
CDP_API_KEY_ID=<your-api-key-id>
CDP_API_KEY_SECRET=<your-api-key-secret>
CDP_WALLET_SECRET=<your-wallet-secret>
```

**Get CDP credentials:** [Coinbase CDP Portal](https://portal.cdp.coinbase.com/)

### 4. Fund Treasury Wallet

Visit [solfaucet.com](https://solfaucet.com) and airdrop devnet SOL to your treasury wallet address.

### 5. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3001`

## Tech Stack

- **Node.js + Express** - REST API server
- **Solana Web3.js** - Blockchain interactions
- **Coinbase CDP SDK** - Embedded wallet management
- **Keyword-based AI** - Answer evaluation (can be replaced with OpenAI)

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing Endpoints

**Health check:**
```bash
curl http://localhost:3001/api/health
```

**Test reward:**
```bash
curl -X POST http://localhost:3001/api/reward \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "amount": 0.01
  }'
```

## Security

### Environment Variables
- Never commit `.env` to git
- Keep treasury private key secret
- Rotate keys if exposed

### Rate Limiting (Production)
Add rate limiting for:
- Faucet endpoint (prevent abuse)
- Wallet creation (prevent spam)
- Reward endpoint (prevent exploits)

### Treasury Management
- Monitor treasury balance
- Set MAX_REWARD_AMOUNT to prevent overpayment
- Track total rewards per session

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Create Railway project from repo
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

### Environment Variables for Production

```env
TREASURY_WALLET_KEYPAIR=<base58-key>
SOLANA_NETWORK=devnet
MAX_REWARD_AMOUNT=0.5
PORT=3001
NODE_ENV=production
CDP_API_KEY_ID=<key-id>
CDP_API_KEY_SECRET=<secret>
CDP_WALLET_SECRET=<wallet-secret>
```

## Troubleshooting

### "Treasury wallet not configured"
- Verify `TREASURY_WALLET_KEYPAIR` is set in `.env`
- Must be Base58-encoded private key (not JSON array)
- Restart server after adding env var

### "Insufficient funds"
- Check treasury balance on [Solana Explorer](https://explorer.solana.com?cluster=devnet)
- Airdrop more devnet SOL from faucet
- Each session can pay out max 0.03 SOL

### "CDP service not configured"
- Verify all three CDP env vars are set
- Check for typos in variable names
- Ensure credentials are from [CDP Portal](https://portal.cdp.coinbase.com/)

### "Faucet rate limit exceeded"
- Devnet faucet limits ~10-15 requests/hour per IP
- Use existing wallets instead of creating new ones
- Transfer SOL between wallets manually

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Backend API (Express)                  │
│                                                     │
│  ┌────────────────┐  ┌─────────────┐  ┌──────────┐│
│  │  AI Evaluator  │  │  Treasury   │  │   CDP    ││
│  │  (Keywords)    │  │  Wallet     │  │  Client  ││
│  └────────────────┘  └─────────────┘  └──────────┘│
└─────────────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │      Solana Devnet RPC         │
        │  • Transaction confirmation    │
        │  • Balance queries             │
        │  • Faucet airdrops            │
        └────────────────────────────────┘
```

## For Mainnet (Future)

To deploy on mainnet:

1. Change `SOLANA_NETWORK=mainnet-beta`
2. Update RPC endpoint to mainnet
3. Fund treasury with real SOL
4. Add user authentication
5. Implement stricter rate limiting
6. Add transaction monitoring/alerts
7. Consider multi-sig for treasury

## Documentation

- **Main README**: [../README.md](../README.md)
- **CDP Setup**: [../CDP_SETUP.md](../CDP_SETUP.md)
- **Deployment Guide**: [../DEPLOYMENT.md](../DEPLOYMENT.md)
- **x402 Integration**: [../X402_INTEGRATION.md](../X402_INTEGRATION.md)

## License

MIT License - Open source for x402 hackathon and beyond!

---

**Built for Solana x402 Hackathon - November 2025**
