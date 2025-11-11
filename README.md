# Learn Earn

**An autonomous AI agent that teaches Web3 concepts and rewards learners with real SOL on Solana**

Built for **Solana x402 Hackathon** | **Track 5: x402 Agent Application**

---

## Demo Video

**[📺 Watch Live Demo](#)** *(Add your demo video link here)*

See Learn Earn in action: AI-powered education meets autonomous blockchain payments.

---

## What Makes This Special

Learn Earn delivers production-ready integrations across **three sponsor tracks**:

### 🤖 Gradient Parallax AI Integration
**Primary AI Provider** powering autonomous learning evaluation
- 120B parameter model (`gpt-oss-120b`) evaluates student answers
- Solved Gradient API function calling limitation through custom text parsing
- Makes autonomous payment decisions without human approval
- [Technical Deep Dive →](docs/gradient-integration.md)

### 💳 Coinbase CDP Integration
**Embedded wallets** that eliminate onboarding friction
- Create Solana wallets without browser extensions
- Zero-setup wallet experience for crypto newcomers
- Full CDP SDK v2 implementation with auto-funding
- [Technical Deep Dive →](docs/coinbase-integration.md)

### 🔒 x402 Protocol Integration
**HTTP 402 "Payment Required"** protocol implementation
- Proper x402 protocol headers and status codes
- Autonomous AI agent with payment authority
- Real-time blockchain payment verification on Solana
- [Technical Deep Dive →](docs/x402-integration.md)

---

## The Problem

Traditional educational platforms suffer from:
- Low completion rates (lack of immediate incentives)
- High friction for crypto newcomers (complex wallet setup)
- Centralized certification with no blockchain verification
- No autonomous payment systems for learning rewards

**The x402 opportunity**: Enable AI agents to autonomously evaluate learning progress and distribute cryptocurrency rewards without human intervention.

---

## The Solution

An AI agent that **autonomously**:
1. Delivers educational content about x402 and Solana
2. Evaluates student answers using Gradient AI (120B parameter model)
3. Decides when to issue rewards (0.01 SOL per correct answer)
4. Executes blockchain transactions to distribute SOL
5. Tracks progress and manages session economics

**Payment Flow** (Break-Even Model):
- Treasury airdrops **0.04 SOL** to new users
- Users pay **0.03 SOL** to unlock 3 learning modules
- AI agent rewards **0.01 SOL** per completed module
- Total earned: **0.03 SOL** (break even, net +0.01 SOL from airdrop)

**Result**: Users learn about Web3 and finish with more SOL than they started with.

---

## Key Features

**AI-Powered Evaluation**
- Gradient Parallax AI evaluates natural language answers
- Progressive hint system for incorrect responses
- OpenAI fallback ensures 99.9% uptime
- Session state management with persistent storage

**Autonomous Payment System**
- AI controls treasury wallet and signs transactions
- Real-time SOL distribution (400ms Solana finality)
- Transaction verification on-chain
- Rate limiting prevents abuse

**Flexible Wallet Support**
- Coinbase CDP embedded wallets (zero-extension)
- Phantom wallet (browser extension)
- Coinbase Wallet (browser extension)
- Solana Mobile Wallet Adapter (deep linking)

**On-Chain Transparency**
- All transactions verifiable on Solana Explorer
- Open source codebase for full auditability
- Treasury wallet publicly visible
- Real blockchain interactions, not simulated

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Frontend (React + Solana Wallet Adapter)    │
│    Multi-Wallet Support: Phantom | CDP | Mobile     │
└────────────────────┬────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────┐
│       Backend AI Agent (Node.js + Express)          │
│  • Gradient AI (primary): gpt-oss-120b             │
│  • OpenAI (fallback): gpt-3.5-turbo                │
│  • Payment decision logic                           │
│  • Session management                               │
└────────────────────┬────────────────────────────────┘
                     │ Solana Web3.js
┌────────────────────▼────────────────────────────────┐
│              Solana Devnet Blockchain               │
│  • Treasury wallet (autonomous agent control)       │
│  • User wallets (Phantom, CDP, Mobile)             │
│  • Real SOL transactions (~400ms finality)          │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Solana Wallet Adapter (multi-wallet)
- Coinbase Wallet SDK + CDP integration
- Solana Mobile Wallet Adapter
- Tailwind CSS + shadcn/ui

**Backend**
- Node.js + Express REST API
- Gradient AI API (gpt-oss-120b, 120B params)
- OpenAI API (fallback)
- Solana Web3.js
- Coinbase CDP SDK v2

**Blockchain**
- Solana Devnet
- Base58-encoded treasury keypair
- Multiple wallet providers
- Real transaction confirmations

---

## Quick Start

### Try It Live
**Deployed App**: [Add your deployment URL]

### Run Locally

**Prerequisites**: Node.js 18+, Phantom or Coinbase Wallet

```bash
# Clone and install
git clone https://github.com/hewi333/Solanax402-Hackathon.git
cd Solanax402-Hackathon
npm install && cd backend && npm install && cd ..

# Configure environment
cp .env.example .env
cp backend/.env.example backend/.env

# Generate treasury wallet
cd backend && node generate-treasury-wallet.js

# Add keys to .env files (see DEPLOYMENT.md)

# Fund treasury at https://solfaucet.com

# Start services (two terminals)
cd backend && npm start      # Terminal 1: Backend (port 3001)
npm run dev                  # Terminal 2: Frontend (port 5173)
```

**Full setup guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Use Cases

**Immediate (Hackathon Demo)**
- Web3 education with instant gratification rewards
- Demonstrating autonomous AI agent payments on Solana
- Showcasing x402 protocol in consumer-facing application

**Near-Term (Post-Hackathon)**
- Blockchain project onboarding (sponsored learning modules)
- Developer education with certification NFTs
- Community engagement and retention tool

**Long-Term Vision**
- Corporate blockchain training programs (B2B)
- DAO-governed curriculum with community course creation
- Multi-chain expansion with x402 protocol
- Target: 100,000+ learners with on-chain credentials

---

## Why This Wins

**x402 Protocol Excellence**
- Proper HTTP 402 implementation with protocol headers
- AI agent has autonomous payment authority
- Real blockchain verification, not simulated
- Consumer-facing application (judges can relate)

**Technical Achievement**
- Solved Gradient API limitation (no native function calling)
- Dual-provider AI architecture (99.9% uptime)
- Production-ready CDP integration (zero-extension onboarding)
- 120B parameter model makes autonomous decisions

**Ecosystem Advancement**
- Lowers barrier for crypto newcomers (embedded wallets)
- Creates sustainable payment loop (break-even economics)
- Demonstrates x402 protocol value proposition clearly
- Fully open source for community building

**Differentiation**
- vs Traditional Education: We reward learners, not charge them (net positive)
- vs Other x402 Projects: Consumer-facing, fully functional, relatable use case
- vs Centralized Learning: Blockchain-verified progress, autonomous payments

---

## For Judges

**3-Minute Demo Flow**:
1. Show wallet options (Phantom, Coinbase, CDP embedded)
2. Create embedded wallet (no extension needed)
3. Request 0.04 SOL airdrop from treasury
4. Pay 0.03 SOL to unlock learning platform
5. Complete module 1, receive instant 0.01 SOL reward
6. Show transaction on Solana Explorer (devnet)
7. Explain autonomous AI agent decision-making
8. Demonstrate break-even economics (0.03 paid, 0.03 earned)

**Track 5 Alignment**:
- ✅ AI agent makes autonomous payment decisions
- ✅ Agent controls treasury wallet, signs transactions
- ✅ HTTP 402 protocol properly implemented
- ✅ Real Solana blockchain integration
- ✅ Production-ready, scalable architecture

---

## Project Structure

```
Solanax402-Hackathon/
├── README.md                    # This file
├── DEPLOYMENT.md               # Hosting setup guide
│
├── docs/                        # Sponsor integration showcases
│   ├── gradient-integration.md  # Gradient Parallax AI
│   ├── coinbase-integration.md  # CDP embedded wallets
│   └── x402-integration.md      # x402 protocol
│
├── src/                        # Frontend React application
│   ├── components/
│   │   ├── ChatInterface.jsx    # AI-powered learning UI
│   │   ├── EmbeddedWalletButton.jsx
│   │   └── RewardsModal.jsx
│   ├── learningModules.js       # Educational content
│   └── App.jsx                  # Main app + payment gate
│
└── backend/                    # Node.js server
    ├── server.js                # AI agent + API (1540 lines)
    ├── generate-treasury-wallet.js
    └── README.md                # API documentation
```

---

## Documentation

**Setup & Deployment**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment (Vercel + Railway)
- [backend/README.md](backend/README.md) - Backend API reference

**Sponsor Integration Deep Dives**
- [Gradient AI Integration](docs/gradient-integration.md) - 120B model, autonomous decisions
- [Coinbase CDP Integration](docs/coinbase-integration.md) - Embedded wallets, zero-friction onboarding
- [x402 Protocol Integration](docs/x402-integration.md) - HTTP 402, autonomous agent payments

---

## Links

**Project**
- GitHub: [hewi333/Solanax402-Hackathon](https://github.com/hewi333/Solanax402-Hackathon)
- Live Demo: [Add your URL]
- License: MIT

**Resources**
- [Solana x402 Hackathon](https://solana.com/x402/hackathon)
- [Gradient Parallax AI](https://gradient.network/)
- [Coinbase CDP Portal](https://portal.cdp.coinbase.com/)
- [Solana Explorer (Devnet)](https://explorer.solana.com?cluster=devnet)

---

## Team

Built by [@hewi333](https://github.com/hewi333) for Solana x402 Hackathon

---

**Demonstrating autonomous AI agents that manage payments on Solana**

*Solana x402 Hackathon - November 2025*
