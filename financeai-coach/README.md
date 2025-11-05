# FinanceAI Coach 💰

> Your AI-powered finance coach that rewards good habits with instant crypto

An innovative web application built for the Solana x402 Hackathon that combines AI coaching with instant cryptocurrency rewards to help users build better financial habits.

## Features

- **AI-Powered Coaching**: Natural language conversations with an AI finance coach powered by OpenAI
- **Habit Detection**: Automatically recognizes financial milestones and good habits
- **Instant Rewards**: Earn SOL tokens for completing financial habits
- **Wallet Integration**: Seamless Phantom wallet connection on Solana Devnet
- **Progress Tracking**: Dashboard showing habits completed, total earned, and current streaks
- **Beautiful UI**: Modern, responsive design with Solana-inspired aesthetics

## Prerequisites

- Node.js 18 or higher
- Phantom wallet browser extension
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))
- Solana Devnet SOL (get free from [solfaucet.com](https://solfaucet.com))

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
   ```

### Backend Setup (Required for AI Chat)

4. **Navigate to backend directory**
   ```bash
   cd ../backend
   ```

5. **Install backend dependencies**
   ```bash
   npm install
   ```

6. **Configure OpenAI API key**
   ```bash
   cp .env.example .env
   ```

   Edit `backend/.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   PORT=3001
   ```

   **Get your OpenAI API key at:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

7. **Start the backend server**
   ```bash
   npm start
   ```

   Keep this terminal open - the backend must be running for the chat to work.

### Start the Frontend

8. **Open a new terminal and start the frontend**
   ```bash
   cd financeai-coach
   npm run dev
   ```

9. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Connect your Phantom wallet
   - Switch Phantom to Devnet mode
   - Start chatting with the AI coach!

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve the Phantom connection
2. **Start Chatting**: Talk to the AI coach about your financial goals
3. **Complete Habits**: Mention financial activities like:
   - Creating a budget
   - Setting savings goals
   - Tracking expenses
   - Daily financial check-ins
   - Learning about finance
4. **Earn Rewards**: Get instant SOL rewards when habits are detected
5. **Track Progress**: View your stats on the dashboard

## Financial Habits & Rewards

| Habit | Reward | Example |
|-------|--------|---------|
| Budget Creation | 0.05 SOL | "I want to set a budget of $2000/month" |
| Savings Goal | 0.05 SOL | "I'm saving for a vacation" |
| Expense Tracking | 0.02 SOL | "I spent $50 on groceries today" |
| Daily Check-in | 0.01 SOL | "Daily check: spent $20 today" |
| Learning Module | 0.03 SOL | "Can you teach me about investing?" |

## Tech Stack

- **Frontend**: React 19 + Vite
- **Blockchain**: Solana (Devnet)
- **Wallet**: Solana Wallet Adapter + Phantom
- **AI**: OpenAI GPT-4
- **Styling**: Custom CSS with Solana-inspired design

## Project Structure

```
Solanax402-Hackathon/
├── financeai-coach/               # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx      # AI chat component
│   │   │   ├── ChatInterface.css
│   │   │   ├── RewardsModal.jsx       # Reward celebration modal
│   │   │   └── RewardsModal.css
│   │   ├── App.jsx                     # Main app component
│   │   ├── App.css
│   │   ├── main.jsx                    # App entry point
│   │   └── index.css
│   ├── .env.example                    # Frontend environment variables
│   ├── package.json
│   └── README.md
├── backend/                        # Backend Express server
│   ├── server.js                   # Express API server
│   ├── .env.example                # Backend environment variables
│   ├── package.json
│   └── README.md
└── README.md                       # Main project README
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Development

### Running the dev server
```bash
npm run dev
```

### Linting
```bash
npm run lint
```

### Preview production build
```bash
npm run preview
```

## Hackathon Details

- **Hackathon**: Solana x402
- **Track**: Track 5 - x402 Agent Application
- **Deadline**: November 11, 2025
- **Repository**: [github.com/heyhewi/Solanax402-Hackathon](https://github.com/heyhewi/Solanax402-Hackathon)

## Roadmap

- ✅ Wallet integration
- ✅ AI chat interface
- ✅ Habit detection
- ✅ Reward system
- 🚧 Actual SOL transfers (currently simulated)
- 🚧 Persistent storage
- 🚧 Advanced habit tracking
- 🚧 Social features

## Contributing

This is a hackathon project. Contributions and feedback are welcome!

## License

MIT License - see the [LICENSE](../LICENSE) file for details

## Contact

- GitHub: [@heyhewi](https://github.com/heyhewi)
- Project: [Solanax402-Hackathon](https://github.com/heyhewi/Solanax402-Hackathon)

---

**Built with ❤️ for the Solana x402 Hackathon**
