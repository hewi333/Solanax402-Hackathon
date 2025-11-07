// Learning modules for Solana x402 Hackathon
export const LEARNING_MODULES = [
  {
    id: 1,
    title: "What is the Solana x402 Hackathon?",
    description: "Learn about the hackathon you're participating in right now!",
    reward: 0.01,  // Reduced for testing - 5 modules = 0.05 SOL total

    lessonContent: `The Solana x402 Hackathon is a competition focused on building AI agents that can autonomously interact with the Solana blockchain.

The name "x402" refers to the HTTP 402 "Payment Required" status code - representing the future where AI agents can make and receive payments autonomously.

The hackathon has 5 tracks, and we're building for Track 5: "x402 Agent Application" - real-world AI agent use cases!`,

    question: "What does 'x402' refer to in the hackathon name?",

    evaluationKeywords: ["payment", "402", "http", "status code", "pay"],

    hints: [
      "Think about HTTP status codes...",
      "It's related to payments and money...",
      "The '402' is actually an HTTP status code!"
    ],

    correctAnswerExample: "x402 refers to HTTP status code 402 'Payment Required', representing AI agents that can handle payments autonomously."
  },

  {
    id: 2,
    title: "Why Solana for AI Agents?",
    description: "Discover why Solana is perfect for AI agent applications",
    reward: 0.01,  // Reduced for testing - 5 modules = 0.05 SOL total

    lessonContent: `Solana is uniquely suited for AI agents because:

🚀 **Speed**: 400ms confirmation times mean agents can act instantly
💰 **Cost**: $0.00025 per transaction enables micropayments
📈 **Scale**: 65,000 TPS can handle millions of agent interactions
⚡ **No Mempool**: Agents don't compete with MEV bots

This means AI agents can make hundreds of small decisions and payments without worrying about cost or speed!`,

    question: "Name at least TWO reasons why Solana is perfect for AI agents.",

    evaluationKeywords: ["fast", "speed", "cheap", "cost", "scale", "tps", "instant", "micropayment", "400ms", "65000", "low fee"],

    hints: [
      "Think about transaction speed and cost...",
      "How fast can Solana confirm transactions?",
      "What about the cost per transaction?"
    ],

    correctAnswerExample: "Solana is fast (400ms confirmations) and cheap ($0.00025/tx), making it perfect for AI agents that need to make many small payments quickly."
  },

  {
    id: 3,
    title: "Agent Autonomy & Decision Making",
    description: "What makes an AI agent truly 'autonomous'?",
    reward: 0.01,  // Reduced for testing - 5 modules = 0.05 SOL total

    lessonContent: `A TRUE x402 AI agent is autonomous, meaning:

🤖 **Makes Decisions**: The agent evaluates situations and decides what to do (not just following hardcoded rules)

💸 **Controls Money**: The agent can initiate payments without human approval for each transaction

🧠 **Learns & Adapts**: The agent uses AI to understand context and make intelligent choices

🔄 **Closed Loop**: The agent manages entire workflows from start to finish

Right now, YOU are experiencing this! I'm evaluating your answers and deciding whether to send you rewards - no human in the loop!`,

    question: "What does it mean for an AI agent to be 'autonomous'? Give at least one key characteristic.",

    evaluationKeywords: ["decision", "decide", "independent", "control", "payment", "automatic", "evaluate", "judge", "choose", "money"],

    hints: [
      "Think about what I'm doing right now with your answers...",
      "Who decides if you get rewarded?",
      "An autonomous agent makes its own..."
    ],

    correctAnswerExample: "An autonomous agent makes its own decisions without human approval each time, like deciding when to send payments based on evaluation."
  },

  {
    id: 4,
    title: "Solana's Technical Magic",
    description: "The tech that makes instant AI agents possible",
    reward: 0.01,  // Reduced for testing - 5 modules = 0.05 SOL total

    lessonContent: `Solana achieves its speed through innovative tech:

⏰ **Proof of History (PoH)**: Timestamps transactions cryptographically, eliminating time negotiation between nodes

🔄 **Parallel Processing**: Multiple smart contracts run simultaneously (unlike Ethereum's serial execution)

🌊 **Gulf Stream**: Transactions forwarded before block finality, reducing confirmation time

📦 **Turbine**: Block propagation protocol that breaks data into small packets

This architecture means AI agents get near-instant feedback on their actions!`,

    question: "What is Proof of History and why does it matter for speed?",

    evaluationKeywords: ["timestamp", "time", "clock", "proof of history", "poh", "history", "order", "sequence", "cryptographic"],

    hints: [
      "It's about TIME and ordering...",
      "How does Solana know what happened when?",
      "It's a cryptographic way to timestamp events..."
    ],

    correctAnswerExample: "Proof of History cryptographically timestamps transactions, creating a historical record that proves events occurred in a specific order, eliminating the need for nodes to communicate about time."
  },

  {
    id: 5,
    title: "Hackathon Fun Facts! 🎉",
    description: "Time for some fun Solana knowledge!",
    reward: 0.01,  // Reduced for testing - 5 modules = 0.05 SOL total

    lessonContent: `Let's end with some fun facts about Solana and this hackathon:

🏆 The prize pool is $50,000 across 5 tracks ($10,000 per track!)

🦎 Solana's mascot is... well, there's a lot of gecko/lizard vibes in the community

💜 Solana's brand color is that distinctive purple-to-green gradient you see everywhere

🌍 The hackathon is fully online and global - anyone can participate

🤖 You're literally learning INSIDE a hackathon submission right now (how meta!)

And the best part? This entire app is open source, so anyone can fork it and teach other topics!`,

    question: "Here's a fun one: What are you doing RIGHT NOW in this very moment? (Hint: it's meta!)",

    evaluationKeywords: ["learning", "hackathon", "submission", "app", "project", "demo", "x402", "agent", "inside", "meta"],

    hints: [
      "Look around... what app are you using?",
      "This app IS a hackathon submission...",
      "You're learning inside a..."
    ],

    correctAnswerExample: "I'm learning inside a hackathon submission! This app is both teaching me AND demonstrating the x402 concept at the same time!"
  }
]

export const getModuleById = (id) => {
  return LEARNING_MODULES.find(module => module.id === id)
}

export const getTotalReward = () => {
  return LEARNING_MODULES.reduce((sum, module) => sum + module.reward, 0)
}

export const getModuleCount = () => {
  return LEARNING_MODULES.length
}
