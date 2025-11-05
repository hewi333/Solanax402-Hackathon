import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize Solana connection (Devnet)
const connection = new Connection(
  process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'),
  'confirmed'
)

// Middleware
app.use(cors())
app.use(express.json())

// Rate limiting for faucet (simple in-memory storage)
const faucetRateLimits = new Map()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FinanceAI Coach API is running',
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    solanaConnected: true
  })
})

// Faucet endpoint - Airdrop SOL to user's wallet
app.post('/api/faucet', async (req, res) => {
  try {
    const { walletAddress } = req.body

    if (!walletAddress) {
      return res.status(400).json({
        error: 'Wallet address is required'
      })
    }

    // Validate wallet address format
    let publicKey
    try {
      publicKey = new PublicKey(walletAddress)
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid wallet address format'
      })
    }

    // Rate limiting: 1 airdrop per wallet per hour
    const now = Date.now()
    const lastRequest = faucetRateLimits.get(walletAddress)
    const ONE_HOUR = 60 * 60 * 1000

    if (lastRequest && (now - lastRequest) < ONE_HOUR) {
      const timeLeft = Math.ceil((ONE_HOUR - (now - lastRequest)) / 1000 / 60)
      return res.status(429).json({
        error: `Rate limit exceeded. Please try again in ${timeLeft} minutes.`
      })
    }

    // Request airdrop from Solana devnet
    console.log(`🚰 Requesting airdrop for ${walletAddress}`)
    const airdropAmount = 1 * LAMPORTS_PER_SOL // 1 SOL

    const signature = await connection.requestAirdrop(publicKey, airdropAmount)

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed')

    // Update rate limit
    faucetRateLimits.set(walletAddress, now)

    console.log(`✅ Airdrop successful: ${signature}`)

    res.json({
      success: true,
      signature,
      amount: 1.0,
      message: 'Successfully airdropped 1 SOL to your wallet!'
    })

  } catch (error) {
    console.error('Faucet error:', error)

    // Handle specific errors
    if (error.message?.includes('airdrop request failed')) {
      return res.status(503).json({
        error: 'Devnet faucet is currently unavailable. Please try again in a moment.'
      })
    }

    res.status(500).json({
      error: error.message || 'Failed to airdrop SOL. Please try again.'
    })
  }
})

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.'
      })
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request. Messages array is required.'
      })
    }

    // Add system message for financial coaching
    const systemMessage = {
      role: 'system',
      content: `You are a friendly and encouraging personal finance coach. Your role is to:
- Help users set and achieve financial goals
- Provide practical money management advice
- Celebrate small wins and progress
- Keep responses conversational, warm, and motivating
- Ask follow-up questions to understand their situation better
- Encourage good financial habits like budgeting, saving, and tracking expenses
- Keep responses concise (2-3 sentences usually)
- Be enthusiastic and supportive`
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...messages],
      max_tokens: 150,
      temperature: 0.7
    })

    const reply = completion.choices[0].message.content

    res.json({
      message: reply,
      usage: completion.usage
    })

  } catch (error) {
    console.error('Error calling OpenAI:', error)

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid OpenAI API key. Please check your configuration.'
      })
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again in a moment.'
      })
    }

    if (error.status === 500) {
      return res.status(500).json({
        error: 'OpenAI service error. Please try again later.'
      })
    }

    res.status(500).json({
      error: error.message || 'An error occurred while processing your request.'
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FinanceAI Coach Backend running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🤖 OpenAI configured: ${!!process.env.OPENAI_API_KEY}`)

  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  Warning: OPENAI_API_KEY not set in environment variables')
  }
})

export default app
