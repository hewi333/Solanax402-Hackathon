# Solana x402 Learn & Earn

> Learn about Solana x402 AI agents and earn SOL as you progress through interactive modules

An innovative Learn-to-Earn platform built for the Solana x402 Hackathon. Users pay 0.5 SOL to unlock 5 interactive learning modules about Solana x402 AI agents, and earn their payment back by completing the modules. The entire experience is managed by an autonomous AI agent.

## Features

- **AI-Powered Learning**: Interactive lessons guided by an autonomous AI agent
- **Learn & Earn Model**: Pay 0.5 SOL upfront, earn it back by completing modules (0.1 SOL per module)
- **5 Learning Modules**: Comprehensive curriculum covering Solana x402 AI agents
- **Autonomous Agent**: AI evaluates answers, provides hints, and distributes rewards automatically
- **Wallet Integration**: Seamless Phantom wallet connection on Solana Devnet
- **Progress Tracking**: Real-time dashboard showing modules completed and earnings
- **Beautiful UI**: Modern, responsive design with Solana brand colors and shadcn/ui components

## What is x402?

This project demonstrates the Solana x402 AI agent framework - autonomous AI agents that can manage cryptocurrency payments without human intervention. The AI agent in this app:
- Evaluates your learning progress
- Decides when to reward you
- Sends SOL payments automatically
- Manages the entire learn-to-earn experience

## Prerequisites

- Node.js 18 or higher
- Phantom wallet browser extension
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))
- Solana Devnet SOL (use the built-in faucet or get from [solfaucet.com](https://solfaucet.com))

## Installation

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/heyhewi/Solanax402-Hackathon.git
   cd Solanax402-Hackathon/financeai-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   The `.env` file should look like:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_SOLANA_NETWORK=devnet
   VITE_SOLANA_RPC_HOST=https://api.devnet.solana.com
   VITE_TREASURY_WALLET=<your-treasury-wallet-public-key>
   ```

### Backend Setup (Required for AI Agent)

4. **Navigate to backend directory**
   ```bash
   cd ../backend
   ```

5. **Install backend dependencies**
   ```bash
   npm install
   ```

6. **Generate treasury wallet**
   ```bash
   node generate-treasury-wallet.js
   ```

   This creates a new Solana wallet that will receive payments and distribute rewards.
   **Important**: Save the generated keypair securely!

7. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   PORT=3001
   SOLANA_NETWORK=devnet
   TREASURY_WALLET_PATH=./treasury-wallet.json
   ```

   **Get your OpenAI API key at:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

8. **Fund the treasury wallet**
   - Copy the treasury wallet public key
   - Get devnet SOL from [solfaucet.com](https://solfaucet.com)
   - The wallet needs ~2-3 SOL to distribute rewards

9. **Start the backend server**
   ```bash
   npm start
   ```

   Keep this terminal open - the backend must be running for the learning platform to work.

### Start the Frontend

10. **Open a new terminal and start the frontend**
    ```bash
    cd financeai-coach
    npm run dev
    ```

11. **Open your browser**
    - Navigate to `http://localhost:5173`
    - Connect your Phantom wallet
    - Switch Phantom to Devnet mode
    - Start your learning journey!

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve the Phantom connection
2. **Get Devnet SOL**: Use the built-in faucet button to get test SOL (if needed)
3. **Pay to Unlock**: Pay 0.5 SOL to unlock the learning modules
4. **Learn**: Work through 5 interactive modules about Solana x402 AI agents
5. **Earn**: Answer questions correctly to earn 0.1 SOL per module
6. **Complete**: Finish all 5 modules to earn back your full 0.5 SOL deposit!

## Learning Modules

The platform teaches you about:
1. What is Solana x402 and why it matters
2. How AI agents work on Solana
3. Real-world use cases for x402 agents
4. The x402 agent framework and architecture
5. Building your own x402 AI agent

## Architecture

### Frontend (React + Vite)
- Modern React 19 with hooks
- Solana wallet adapter for Phantom integration
- shadcn/ui components with Tailwind CSS
- Real-time progress tracking

### Backend (Express + OpenAI)
- RESTful API for AI agent interactions
- OpenAI GPT for lesson delivery and answer evaluation
- Autonomous reward distribution system
- Solana Web3.js for blockchain interactions

### Smart Features
- Keyword-based answer evaluation
- Progressive hint system for incorrect answers
- Automatic SOL distribution on correct answers
- Session management and progress persistence

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, OpenAI API
- **Blockchain**: Solana (Devnet), @solana/web3.js, @solana/wallet-adapter
- **UI Components**: Radix UI, lucide-react icons
- **AI**: OpenAI GPT-4

## Development

```bash
# Frontend
cd financeai-coach
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build

# Backend
cd backend
npm start       # Start backend server
npm run dev     # Start with auto-reload (nodemon)
```

## Contributing

Built for the Solana x402 Hackathon. Contributions welcome!

## License

MIT

## Built With ❤️ for Solana x402 Hackathon

This project showcases autonomous AI agents on Solana - where AI makes decisions and manages crypto without human intervention.

---

**Links:**
- [Solana x402 Hackathon](https://solana.com/x402/hackathon)
- [GitHub Repository](https://github.com/heyhewi/Solanax402-Hackathon)
