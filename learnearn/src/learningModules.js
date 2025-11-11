// Learning modules for Solana x402 Hackathon
// Simplified to 3 modules for easy hackathon judging flow
export const LEARNING_MODULES = [
  {
    id: 1,
    title: "What is x402?",
    description: "Learn about the x402 protocol",
    reward: 0.01,  // 3 modules = 0.03 SOL total

    lessonContent: `The x402 protocol represents the future of AI-powered payments.

The name "x402" comes from HTTP status code 402: "Payment Required"

This hackathon is about building AI agents that can autonomously make payment decisions using Solana.`,

    question: "What does x402 stand for?",

    evaluationKeywords: ["payment", "402", "http", "pay", "required", "status"],

    hints: [
      "It's an HTTP status code...",
      "The number is 402..."
    ],

    correctAnswerExample: "HTTP 402 Payment Required"
  },

  {
    id: 2,
    title: "Why AI Agents?",
    description: "Understanding autonomous AI agents",
    reward: 0.01,  // 3 modules = 0.03 SOL total

    lessonContent: `AI agents can make autonomous decisions without human approval each time.

In this app, an AI agent is:
- Evaluating your answers
- Deciding if you pass
- Sending SOL payments automatically

No human reviews your answers - the AI does it all!`,

    question: "What is this AI agent doing right now?",

    evaluationKeywords: ["evaluate", "evaluating", "answer", "decision", "payment", "decide", "judge", "check", "review", "assess"],

    hints: [
      "What's happening when you submit an answer?",
      "Who is checking if your answer is correct?"
    ],

    correctAnswerExample: "Evaluating my answers and deciding whether to send payment"
  },

  {
    id: 3,
    title: "How Does This Work?",
    description: "The complete flow",
    reward: 0.01,  // 3 modules = 0.03 SOL total

    lessonContent: `Here's what happened:

1. You paid 0.03 SOL to access this learning platform (x402 protocol!)
2. An AI agent evaluates each answer you submit
3. If you pass, the AI sends 0.01 SOL back to your wallet
4. Complete all 3 modules to earn back your full 0.03 SOL (break-even)!

This demonstrates AI agents + payments + Solana all working together.

The key innovation: The AI agent has autonomous control over the wallet that holds your funds. It can make payment decisions without human approval based on evaluating your answers.`,

    question: "What makes x402 AI agents different from traditional payment systems?",

    evaluationKeywords: ["autonomous", "automatic", "ai", "decision", "evaluation", "human", "approval", "agent", "control", "wallet", "without", "independent"],

    hints: [
      "Think about who or what is making the payment decisions...",
      "Does a human need to approve each payment, or does the AI decide?"
    ],

    correctAnswerExample: "AI agents can make autonomous payment decisions without requiring human approval for each transaction"
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
