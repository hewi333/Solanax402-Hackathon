# x402 AI Agent - Solana Learn & Earn Platform

> **Autonomous AI agent that teaches Web3 concepts and rewards learners with real crypto**

An educational platform demonstrating the power of x402 AI agents on Solana. Pay 0.5 SOL to unlock 5 learning modules about the x402 Hackathon, then earn your money back by completing them—all managed by an autonomous AI agent that evaluates answers and distributes rewards without human intervention.

**Solana x402 Hackathon | Track 5: x402 Agent Application**

---

## 🎯 What This Demonstrates

This project showcases three critical x402 ecosystem capabilities:

### 1. **Autonomous AI Agent**
An AI agent that independently:
- Delivers educational content
- Evaluates student answers using keyword matching
- Decides when to pay rewards
- Executes Solana transactions automatically
- No human in the loop

### 2. **Multiple Wallet Connection Options**
Users can connect via:
- **Phantom Wallet** (browser extension)
- **Coinbase Wallet** (browser extension)
- **Coinbase CDP Embedded Wallets** (no extension needed)
- **Mobile Wallet Adapter** (Solana Mobile deep linking)

This demonstrates wallet flexibility critical for mainstream adoption.

### 3. **Closed-Loop Payment Economy**
- Users invest 0.5 SOL upfront (creates commitment)
- AI rewards 0.1 SOL per completed module
- Earn back full deposit by finishing all 5 modules
- Session automatically closes at break-even
- New sessions require new payment—sustainable model

---

## 🚀 Why This Matters for x402

### The x402 Vision
**HTTP 402 Payment Required** is a status code reserved for future digital payment systems. The Solana x402 Hackathon explores AI agents that can autonomously manage payments.

### Our Implementation
We built an AI agent that:
- ✅ **Autonomous Decision-Making**: Evaluates learning progress and decides rewards
- ✅ **Payment Authority**: Controls a treasury wallet and executes transactions
- ✅ **Solana-Native**: Leverages 400ms confirmation times for instant gratification
- ✅ **Real-World Use Case**: Educational platforms with verifiable on-chain credentials
- ✅ **Scalable**: Can handle thousands of concurrent learners

### Problem Solved
Traditional educational platforms struggle with:
- Lack of engagement and completion rates
- No immediate rewards for progress
- Centralized certification systems
- High friction for crypto newcomers (wallet setup)

**Our solution**: An AI agent that makes learning engaging through instant crypto rewards, while offering flexible wallet options including embedded wallets that require zero setup

---

## ✨ Key Features

### 🤖 AI-Powered Learning Experience
- Natural language conversations about x402 concepts
- 5 comprehensive modules covering the x402 ecosystem
- Progressive hint system for incorrect answers
- Keyword-based evaluation with flexible matching

### 💰 Autonomous Payment System
- **Deposit**: 0.5 SOL unlocks all modules
- **Earn**: 0.1 SOL per correct answer
- **Transparent**: All transactions viewable on Solana Explorer
- **Fast**: ~400ms transaction confirmations
- **Cheap**: ~$0.00025 per transaction

### 🔗 Flexible Wallet Integration
- **Browser Extensions**: Phantom & Coinbase Wallet
- **Embedded Wallets**: Coinbase CDP (no extension needed)
- **Mobile Support**: Solana Mobile Wallet Adapter
- Easy onboarding for crypto newcomers

### 📚 Educational Content
Five modules teaching:
1. What is the Solana x402 Hackathon?
2. How AI Agents Work on Solana
3. Payment Automation with AI Agents
4. Building x402 Applications
5. The Future of AI + Blockchain

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              User Interface (React + Vite)              │
│   Phantom | Coinbase | CDP Embedded | Mobile Wallet    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Payment Gate (0.5 SOL Deposit)             │
│          User → Treasury Wallet (Solana Devnet)         │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│           Autonomous AI Agent (Backend API)             │
│  • Module delivery system                               │
│  • Answer evaluation (keyword matching)                 │
│  • Progressive hint generation                          │
│  • Session state management                             │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│         Autonomous Reward Distribution System           │
│  • Treasury wallet (keypair-based on Solana)           │
│  • 0.1 SOL per correct answer                          │
│  • Automatic session closure at 0.5 SOL earned         │
│  • On-chain transaction verification                    │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend**
- React 19 + Vite
- Solana Wallet Adapter (multi-wallet support)
- Coinbase Wallet SDK + CDP integration
- Mobile Wallet Adapter (Solana Mobile)
- Tailwind CSS + shadcn/ui components

**Backend**
- Node.js + Express REST API
- AI-powered answer evaluation (keyword-based)
- Solana Web3.js for blockchain interactions
- Treasury wallet management
- Coinbase CDP SDK for embedded wallets

**Blockchain**
- Solana Devnet (demonstration)
- Multiple wallet providers (Phantom, Coinbase, Mobile)
- Base58-encoded keypair for treasury
- Transaction confirmations with retry logic

---

## 📂 Project Structure

```
Solanax402-Hackathon/
├── README.md                    # This file
├── QUICKSTART.md               # Detailed setup guide
├── DEPLOYMENT.md               # Production deployment
├── CDP_SETUP.md                # Coinbase embedded wallet setup
├── SUBMISSION_CHECKLIST.md     # Hackathon submission guide
│
├── src/                        # Frontend React application
│   ├── components/
│   │   ├── ChatInterface.jsx    # Main learning interface
│   │   └── RewardsModal.jsx     # Celebration UI
│   ├── learningModules.js       # Educational content
│   ├── App.jsx                  # Main app with payment gate
│   └── main.jsx                 # Wallet provider config
│
├── backend/                    # Backend Node.js server
│   ├── server.js                # Main API server
│   │   ├── /api/chat            # AI-powered learning
│   │   ├── /api/reward          # Reward distribution
│   │   ├── /api/faucet          # Devnet SOL airdrop
│   │   ├── /api/cdp/*          # Embedded wallet endpoints
│   │   └── /api/health          # Health check
│   ├── generate-treasury-wallet.js
│   └── README.md
│
├── package.json
└── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Phantom or Coinbase Wallet extension (or use embedded wallet)
- Solana devnet SOL ([get free from faucet](https://solfaucet.com))

### Installation

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

# Set up environment variables
cp .env.example .env
cp backend/.env.example backend/.env
```

### Configuration

**Generate Treasury Wallet:**
```bash
cd backend
node generate-treasury-wallet.js
# Save the output - you'll need both public and private keys
```

**Backend (`backend/.env`):**
```env
TREASURY_WALLET_KEYPAIR=<base58-encoded-private-key>
SOLANA_NETWORK=devnet
MAX_REWARD_AMOUNT=0.5
PORT=3001
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:3001
VITE_TREASURY_WALLET=<treasury-public-key>
VITE_SOLANA_RPC_HOST=https://api.devnet.solana.com
```

**Fund Treasury Wallet:**
Visit [solfaucet.com](https://solfaucet.com) with your treasury public key and airdrop devnet SOL.

### Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
npm run dev
# Open http://localhost:5173
```

**Full setup instructions**: See [QUICKSTART.md](QUICKSTART.md)

---

## 💡 How to Use

1. **Connect Wallet** - Choose from Phantom, Coinbase, embedded wallet, or mobile
2. **Get Devnet SOL** - Use the built-in faucet or [solfaucet.com](https://solfaucet.com)
3. **Pay 0.5 SOL** - Unlock the learning platform
4. **Learn & Earn** - Complete 5 modules, earn 0.1 SOL each
5. **Break Even** - Session ends when you've earned back your 0.5 SOL
6. **Start Again** - New session requires new payment

**Why the payment gate?** Creates commitment and demonstrates the x402 payment automation concept

---

## 🎬 For Hackathon Judges

### Track 5 Alignment: x402 Agent Application

This project perfectly demonstrates the x402 concept:

✅ **Real AI Agent Use Case**: Not just infrastructure—actual consumer application
✅ **Autonomous Payments**: AI controls treasury and executes transactions
✅ **Solana Advantages**: Speed and cost enable micropayment model
✅ **Innovative Economics**: Pay-to-learn-to-earn creates sustainable loop
✅ **Production Ready**: Scalable architecture, multiple wallet options
✅ **Accessible**: Embedded wallets lower barrier for crypto newcomers

### Differentiation

**vs Traditional Learning Platforms:**
- We reward learners, they charge learners
- AI evaluation vs human grading
- Blockchain-verified completion vs centralized certificates

**vs Other x402 Projects:**
- Consumer-facing (relatable to judges)
- Fully functional demo (not just prototype)
- Clear value proposition (education + rewards)
- Multiple wallet options (accessibility focus)

### Demo Flow (3 minutes)

1. Show wallet connection options (Phantom, Coinbase, embedded)
2. Create embedded wallet (no extension required)
3. Pay 0.5 SOL to unlock platform
4. Complete module 1, answer question
5. AI evaluates → instant 0.1 SOL reward
6. Show transaction on Solana Explorer
7. Demonstrate progress tracking
8. Explain scalability and future vision

---

## 🔧 Optional: Coinbase CDP Embedded Wallets

To enable embedded wallets (wallet-as-a-service, no browser extension needed):

1. Get credentials from [Coinbase CDP Portal](https://portal.cdp.coinbase.com/)
2. Add to Railway (backend):
   ```
   CDP_API_KEY_ID=your-key-id
   CDP_API_KEY_SECRET=your-secret
   CDP_WALLET_SECRET=your-wallet-secret
   ```
3. Redeploy - embedded wallet button will activate

**Full CDP setup guide**: See [CDP_SETUP.md](CDP_SETUP.md)

---

## 🧪 Testing

**Manual Test Flow:**
- [ ] Connect wallet (any provider)
- [ ] Pay 0.5 SOL deposit
- [ ] Complete module 1
- [ ] Verify 0.1 SOL reward received
- [ ] Check transaction on Solana Explorer
- [ ] Complete all 5 modules
- [ ] Verify session closes at 0.5 SOL earned
- [ ] Test "Start New Session" flow

**Create embedded wallet test:**
- [ ] Click "Create Embedded Wallet"
- [ ] Verify wallet address displayed
- [ ] Use embedded wallet for payment
- [ ] Verify rewards go to embedded wallet

---

## 📈 Future Vision

**Phase 1 (Post-Hackathon):**
- Mainnet deployment
- 50+ learning modules on various blockchain topics
- Partner with blockchain projects for sponsored content
- On-chain NFT certificates for completion

**Phase 2 (Scaling):**
- Multi-difficulty levels with adjusted rewards
- Corporate training programs (B2B)
- Social features (leaderboards, competitions)
- API for third-party course creators

**Phase 3 (DAO):**
- Community-created courses
- Governance for curriculum decisions
- Token rewards for educators
- Target: 100,000+ learners

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Detailed setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment
- **[CDP_SETUP.md](CDP_SETUP.md)** - Coinbase embedded wallets
- **[SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)** - Hackathon prep
- **[backend/README.md](backend/README.md)** - Backend API docs

---

## 🔗 Links

**Hackathon:**
- Landing Page: [solana.com/x402/hackathon](https://solana.com/x402/hackathon)
- Announcement: [twitter.com/solana/status/1983274986027856208](https://twitter.com/solana/status/1983274986027856208)

**Technical:**
- Solana Docs: [docs.solana.com](https://docs.solana.com)
- Wallet Adapter: [github.com/solana-labs/wallet-adapter](https://github.com/solana-labs/wallet-adapter)
- Coinbase CDP: [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com)
- Devnet Explorer: [explorer.solana.com?cluster=devnet](https://explorer.solana.com?cluster=devnet)

**Code:**
- GitHub: [github.com/heyhewi/Solanax402-Hackathon](https://github.com/heyhewi/Solanax402-Hackathon)
- License: MIT

---

## 👥 Team

**Developer**: [@heyhewi](https://github.com/heyhewi)

Built with ❤️ for the Solana x402 Hackathon

---

## ⭐ Star This Repo!

If you find this project interesting or useful for your own x402 agent development, please star it on GitHub!

---

**Built for Solana x402 Hackathon - November 2025**

*Demonstrating autonomous AI agents that manage payments on Solana*
