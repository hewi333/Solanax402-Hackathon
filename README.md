# x402 AI Agent - Solana Hackathon Learning Platform

> *Learn about the Solana x402 Hackathon, earn back your entry fee through AI-powered education*

**Hackathon:** Solana x402 Hackathon
**Track:** Track 5 - x402 Agent Application
**Deadline:** November 11, 2025
**Prize:** $10,000 (per track)

---

## 🎯 Project Overview

**x402 AI Agent** is an autonomous AI-powered learning platform that demonstrates the power of AI agents managing payments on Solana. Users pay 0.5 SOL to access 5 educational modules about the x402 Hackathon concept, and can earn back their full deposit by correctly answering questions - creating a closed-loop learning economy.

### The x402 Concept

The project name **x402** references:
- **HTTP 402 Payment Required** - A status code reserved for future digital payment systems
- **Solana's x402 Hackathon** - Focused on AI agents that can autonomously manage payments
- **Our Implementation** - An AI agent that autonomously evaluates learning and distributes rewards

### What Makes This Unique

1. **Pay-to-Learn-to-Earn Model**: Users invest 0.5 SOL upfront, creating commitment
2. **Autonomous AI Evaluation**: No human in the loop - AI evaluates answers and pays rewards
3. **Closed-Loop Economy**: Earn back exactly what you paid by completing all modules
4. **Self-Sustaining Sessions**: Each session resets, requiring new payment for continued learning
5. **Transparent On-Chain Rewards**: All payments are verifiable on Solana Explorer

---

## ✨ Key Features

### 🤖 Autonomous AI Agent
- Natural language evaluation of student answers
- Progressive hint system for incorrect responses
- Keyword-based assessment with flexible matching
- No human intervention required for rewards

### 💰 Closed-Loop Payment System
- Initial deposit: 0.5 SOL (unlocks all 5 modules)
- Earn per module: 0.1 SOL (correct answer required)
- Session cap: Automatically stops at 0.5 SOL earned
- New session: Requires new 0.5 SOL payment

### 📚 Educational Content
5 modules covering the Solana x402 Hackathon:
1. What is the Solana x402 Hackathon?
2. How AI Agents Work on Solana
3. Payment Automation with AI
4. Building x402 Applications
5. The Future of AI + Blockchain

### ⚡ Built on Solana
- **Instant rewards** - payments confirmed in ~400ms
- **Minimal fees** - $0.00025 per transaction
- **Scalable** - can handle millions of learners
- **Transparent** - all transactions viewable on-chain

### 🎨 User Experience
- Clean, modern UI with progress tracking
- Real-time progress bar showing earnings vs goal
- Celebration modals for completed modules
- Session completion UI with restart option
- Mobile-responsive design with wallet deep linking

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Experience Layer                    │
│  React + Vite Frontend │ Phantom Wallet │ Progress Tracking │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Payment Gate (0.5 SOL)                   │
│         User deposits to Treasury Wallet on Devnet          │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 AI Learning Engine (Backend)                 │
│  ├─ Module delivery system                                   │
│  ├─ Answer evaluation (keyword matching)                     │
│  ├─ Progressive hint system                                  │
│  └─ Session state management                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Autonomous Reward Distribution                  │
│  ├─ Treasury wallet (Keypair-based)                         │
│  ├─ 0.1 SOL per correct answer                              │
│  ├─ Automatic session closure at 0.5 SOL earned             │
│  └─ On-chain transaction verification                        │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend**
- React 19 + Vite (fast builds, modern tooling)
- Solana Wallet Adapter (Phantom integration)
- Mobile Wallet Adapter (deep linking on mobile)
- Custom CSS (clean, hackathon-ready design)

**Backend**
- Node.js + Express (REST API)
- Solana Web3.js (payment processing)
- AI-powered answer evaluation
- Treasury wallet management

**Blockchain**
- Solana Devnet (for demonstration)
- Phantom Wallet (primary wallet)
- Base58-encoded keypair for treasury wallet
- Transaction confirmations with retry logic

---

## 📂 Project Structure

```
Solanax402-Hackathon/
├── README.md                    # This file
├── QUICKSTART.md               # 5-minute setup guide
├── DEPLOYMENT.md               # Production deployment guide
├── SUBMISSION_CHECKLIST.md     # Hackathon submission checklist
├── PROJECT_PLAN.md             # Original planning documents
├── IMPLEMENTATION_GUIDE.md     # Development notes
│
├── src/                        # Frontend React application
│   ├── components/
│   │   ├── ChatInterface.jsx    # Main learning interface
│   │   ├── ChatInterface.css    # Styles with progress bar
│   │   └── RewardsModal.jsx     # Celebration UI
│   ├── learningModules.js       # 5 educational modules
│   ├── App.jsx                  # Main app with payment gate
│   ├── App.css                  # App-wide styles
│   └── main.jsx                 # Wallet provider config
│
├── backend/                    # Backend Node.js server
│   ├── server.js                # Main API server
│   │   ├── /api/chat            # AI-powered chat
│   │   ├── /api/reward          # Reward distribution
│   │   ├── /api/faucet          # Devnet SOL airdrop
│   │   └── /api/health          # Health check
│   ├── generate-treasury-wallet.js  # Wallet generation utility
│   └── README.md                # Backend documentation
│
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── package.json                # Frontend dependencies
└── vite.config.js              # Vite configuration
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** installed
- **Phantom wallet** browser extension
- **Solana devnet SOL** (free from [solfaucet.com](https://solfaucet.com))

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
# Add your OpenAI API key to backend/.env (optional, for AI chat fallback)
```

### Configuration

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_TREASURY_WALLET=<your-treasury-wallet-public-key>
VITE_SOLANA_RPC_HOST=https://api.devnet.solana.com
```

#### Backend (backend/.env)
```env
PORT=3001
NODE_ENV=development
TREASURY_WALLET_KEYPAIR=<base58-encoded-private-key>
SOLANA_NETWORK=devnet
MAX_REWARD_AMOUNT=0.5
```

#### Generate Treasury Wallet
```bash
cd backend
node generate-treasury-wallet.js
# Copy the Base58 private key to backend/.env
# Copy the public key to frontend .env (VITE_TREASURY_WALLET)
# Fund it with devnet SOL from https://solfaucet.com
```

### Running Locally

```bash
# Terminal 1: Start backend
cd backend
npm start
# Should see: "🚀 Backend running on http://localhost:3001"

# Terminal 2: Start frontend
cd ..
npm run dev
# Open http://localhost:5173
```

### Using the App

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve Phantom connection
   - Ensure Phantom is on **Devnet** mode

2. **Get Devnet SOL**
   - Click "Get Test SOL" button in the app, OR
   - Visit [solfaucet.com](https://solfaucet.com) for 1 SOL airdrop

3. **Pay to Start**
   - Click "Pay 0.5 SOL to Start" button
   - Approve transaction in Phantom
   - Learning interface unlocks

4. **Answer Questions**
   - Read each module's educational content
   - Type your answer in your own words
   - AI evaluates using keyword matching
   - Correct answers earn 0.1 SOL instantly!

5. **Complete Session**
   - Finish all 5 modules (earn 0.5 SOL total)
   - Session automatically closes
   - Click "Start New Session" to repeat

---

## 💡 How It Works

### The Learning Flow

1. **Payment Gate**
   - User pays 0.5 SOL upfront to unlock content
   - Creates commitment and filters serious learners
   - Funds deposited to treasury wallet

2. **Module Delivery**
   - AI presents educational content about x402
   - Each module has a specific question
   - User answers in natural language

3. **Answer Evaluation**
   - AI evaluates answer using keyword matching
   - Flexible matching (only 1 keyword required to pass)
   - Progressive hints for wrong answers

4. **Autonomous Rewards**
   - Correct answer triggers reward transaction
   - Treasury wallet automatically sends 0.1 SOL
   - Transaction confirmed on Solana blockchain
   - No human approval needed

5. **Session Management**
   - Tracks total earned across all modules
   - Progress bar shows earnings toward 0.5 SOL goal
   - Automatically stops at 0.5 SOL (break-even)
   - "Start New Session" requires new payment

### Why This Demonstrates x402

✅ **Autonomous AI Agent**: No humans in the payment loop
✅ **Payment Automation**: AI decides when to pay, executes transactions
✅ **Solana Integration**: Fast, cheap transactions enable this model
✅ **Real-World Use Case**: Educational platforms with verifiable credentials
✅ **Scalable Architecture**: Can handle thousands of concurrent learners

---

## 🎬 Demo

**Live Demo:** [Coming soon]

**Demo Video:** [Coming soon]

**Try It Yourself:**
1. Clone repo and follow Quick Start
2. Use devnet - it's free!
3. Complete all 5 modules
4. Earn back your 0.5 SOL deposit

---

## 🏆 Hackathon Submission

### Track 5: x402 Agent Application

This project demonstrates:
- ✅ **AI agent with payment authority** - Evaluates and pays autonomously
- ✅ **Real-world use case** - Educational platforms with economic incentives
- ✅ **Solana advantages** - Speed and cost enable micropayments
- ✅ **Innovative economic model** - Pay-to-learn-to-earn closed loop
- ✅ **Production-ready architecture** - Can scale to thousands of users

### Differentiation

**vs Traditional Learning Platforms**
- We pay learners, they charge learners
- AI-powered evaluation vs human grading
- Blockchain-verified completion vs centralized certificates

**vs Other Hackathon Projects**
- Consumer-facing vs developer tooling
- Fully functional vs prototype
- Clear value prop vs theoretical concept
- Emotionally compelling vs technically impressive

---

## 📈 Roadmap

### Phase 1: MVP (Hackathon) ✅
- AI-powered learning modules
- Autonomous reward distribution
- Closed-loop payment system
- Mobile wallet support
- Treasury wallet management

### Phase 2: Enhanced Learning (Months 1-3)
- 50+ modules on blockchain topics
- Multi-difficulty levels with adjusted rewards
- Leaderboards and achievements
- Social features (compete with friends)
- Mainnet deployment

### Phase 3: Certification Platform (Months 4-6)
- On-chain credentials (NFTs)
- Employer verification system
- Partner with blockchain projects for sponsored modules
- API for third-party course creators
- Target: 10,000 learners

### Phase 4: Educational DAO (Months 7-12)
- Community-created courses
- Token rewards for course creators
- Governance for curriculum decisions
- B2B: Corporate blockchain training
- Target: 100,000 learners

---

## 💼 Business Model

### Revenue Streams

1. **Sponsored Modules** ($5k-10k per module)
   - Blockchain projects pay to create educational content
   - x402 brands the learning experience
   - Learners still earn rewards

2. **Premium Tiers** ($9.99/month)
   - Access to advanced courses
   - Higher reward multipliers
   - Priority support

3. **B2B Corporate Training** ($499-999/seat)
   - Companies train employees on blockchain
   - Custom curriculum
   - Analytics dashboard

4. **Certification Fees** ($49 per certificate)
   - Verified on-chain credentials
   - Employer verification API
   - Shareable portfolio

5. **Treasury Yield** (Passive)
   - Treasury funds earn yield on DeFi protocols
   - Offsets operational costs

---

## 🔧 Technical Deep Dive

### Treasury Wallet System

The treasury wallet is the heart of autonomous payments:

```javascript
// Generate wallet
const treasuryWallet = Keypair.generate()

// Store private key as Base58 (secure, compact)
const privateKey = bs58.encode(treasuryWallet.secretKey)

// Load in backend
const treasuryWallet = Keypair.fromSecretKey(
  bs58.decode(process.env.TREASURY_WALLET_KEYPAIR)
)

// Send reward (server-side)
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: treasuryWallet.publicKey,
    toPubkey: userPublicKey,
    lamports: 0.1 * LAMPORTS_PER_SOL,
  })
)
```

### Answer Evaluation Engine

Keyword-based evaluation with flexible matching:

```javascript
const evaluateAnswer = (userAnswer) => {
  const keywords = currentModule.evaluationKeywords
  const matchedKeywords = keywords.filter(keyword =>
    userAnswer.toLowerCase().includes(keyword.toLowerCase())
  )
  return {
    passed: matchedKeywords.length >= 1, // Lenient: only 1 match needed
    matchedCount: matchedKeywords.length,
    totalKeywords: keywords.length
  }
}
```

### Session Tracking

Prevents unlimited earnings per session:

```javascript
// Track total earned
const [totalEarned, setTotalEarned] = useState(0)
const [sessionComplete, setSessionComplete] = useState(false)

// After each reward
const newTotalEarned = totalEarned + 0.1
setTotalEarned(newTotalEarned)

// Check for session completion
if (newTotalEarned >= 0.5) {
  setSessionComplete(true)
  // Disable input, show "Start New Session" button
}
```

### Mobile Wallet Support

Deep linking for seamless mobile UX:

```javascript
// Configure mobile wallet adapter
new SolanaMobileWalletAdapter({
  appIdentity: { name: 'x402 Finance AI Coach' },
  authorizationResultCache: {
    get: async () => null,
    set: async () => {},
    clear: async () => {},
  },
})
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Wallet connects on desktop
- [ ] Wallet connects on mobile
- [ ] Payment gate works (0.5 SOL deducted)
- [ ] Modules load sequentially
- [ ] Correct answers trigger rewards
- [ ] Incorrect answers show hints
- [ ] Progress bar updates correctly
- [ ] Session closes at 0.5 SOL earned
- [ ] "Start New Session" resets everything
- [ ] Transactions visible on Solana Explorer

### Test Scenarios

**Happy Path**
1. Connect wallet
2. Pay 0.5 SOL
3. Answer all 5 questions correctly
4. Earn back 0.5 SOL
5. Session completes

**Error Handling**
1. Insufficient balance → Show faucet button
2. Wrong answer → Show hint, allow retry
3. Network error → Show error message
4. Transaction fails → Handle gracefully

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)** - Hackathon prep
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Original planning docs

---

## 🔗 Resources

### Hackathon
- **Landing Page:** https://solana.com/x402/hackathon
- **Announcement:** https://x.com/solana/status/1983274986027856208
- **Submission:** [TBD by organizers]

### Technical
- **Solana Docs:** https://docs.solana.com
- **Wallet Adapter:** https://github.com/solana-labs/wallet-adapter
- **Devnet Explorer:** https://explorer.solana.com?cluster=devnet
- **Devnet Faucet:** https://solfaucet.com

### Code
- **GitHub:** https://github.com/heyhewi/Solanax402-Hackathon
- **Issues:** https://github.com/heyhewi/Solanax402-Hackathon/issues
- **License:** MIT

---

## 👥 Team

**[Your Name]**
- Role: Founder & Developer
- GitHub: [@heyhewi](https://github.com/heyhewi)
- Contact: [Your email]

---

## 📄 License

MIT License - feel free to fork and build upon this project!

See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Solana Foundation** - For hosting the x402 Hackathon
- **Phantom** - For wallet infrastructure
- **Claude** (Anthropic) - For AI development assistance
- **Solana Developer Community** - For documentation and support

---

## 📞 Contact

Questions? Feedback? Want to collaborate?

- **GitHub Issues:** [Submit here](https://github.com/heyhewi/Solanax402-Hackathon/issues)
- **Email:** [Your email]
- **Twitter:** [@yourusername]
- **Discord:** [Your Discord]

---

## ⭐ Star This Repo!

If you found this project interesting or useful, please star it on GitHub! It helps others discover the project and motivates continued development.

---

**Built with ❤️ for the Solana x402 Hackathon**

*Last updated: November 6, 2025*
