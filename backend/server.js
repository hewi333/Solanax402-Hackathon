import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import bs58 from 'bs58'
import { CdpClient } from '@coinbase/cdp-sdk'

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

// Initialize Treasury Wallet
// Supports both base58-encoded private key strings and JSON array format
let treasuryWallet = null
if (process.env.TREASURY_WALLET_KEYPAIR) {
  try {
    const keypairInput = process.env.TREASURY_WALLET_KEYPAIR.trim()
    let secretKey

    // Check if input is a base58 string or JSON array
    if (keypairInput.startsWith('[')) {
      // JSON array format (legacy support)
      const keypairArray = JSON.parse(keypairInput)
      secretKey = Uint8Array.from(keypairArray)
    } else {
      // Base58 encoded string (recommended format)
      secretKey = bs58.decode(keypairInput)
    }

    treasuryWallet = Keypair.fromSecretKey(secretKey)
    console.log(`💰 Treasury wallet loaded: ${treasuryWallet.publicKey.toBase58()}`)
  } catch (error) {
    console.error('⚠️  Failed to load treasury wallet:', error.message)
    console.warn('⚠️  Treasury wallet not configured properly. Please check TREASURY_WALLET_KEYPAIR in .env')
  }
}

// Initialize Coinbase CDP SDK v2
// Add your CDP credentials to .env: CDP_API_KEY_ID, CDP_API_KEY_SECRET
// CDP_WALLET_SECRET is optional - only needed if CDP wallets need to sign transactions
let cdpClient = null
let cdpConfigured = false

if (process.env.CDP_API_KEY_ID && process.env.CDP_API_KEY_SECRET) {
  try {
    // Initialize CDP v2 client
    const cdpConfig = {
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET
    }

    // Add wallet secret only if provided (optional - only needed for signing FROM CDP wallets)
    if (process.env.CDP_WALLET_SECRET) {
      cdpConfig.walletSecret = process.env.CDP_WALLET_SECRET
      console.log('📝 CDP Wallet Secret provided - can sign transactions from CDP wallets')
    } else {
      console.log('ℹ️  CDP Wallet Secret not provided - CDP wallets can receive funds but not send')
    }

    cdpClient = new CdpClient(cdpConfig)
    cdpConfigured = true
    console.log('🏦 Coinbase CDP SDK v2 initialized successfully')
    console.log('API Key ID:', process.env.CDP_API_KEY_ID.substring(0, 8) + '...')
  } catch (error) {
    console.error('⚠️  Failed to initialize CDP SDK v2:', error.message)
    console.error('Full error:', error)
    console.warn('⚠️  CDP embedded wallets will not be available')
  }
} else {
  console.warn('⚠️  CDP v2 credentials not configured.')
  console.warn('Required environment variables:')
  console.warn('  - CDP_API_KEY_ID: Your CDP API key ID (REQUIRED)')
  console.warn('  - CDP_API_KEY_SECRET: Your CDP API key secret (REQUIRED)')
  console.warn('  - CDP_WALLET_SECRET: Your wallet secret (OPTIONAL - only for signing)')
  console.warn('Get credentials from: https://portal.cdp.coinbase.com/')
}

// In-memory storage for CDP wallet data (in production, use a database)
const cdpWalletStore = new Map()

// Middleware
app.use(cors())
app.use(express.json())

// Rate limiting for faucet (simple in-memory storage)
const faucetRateLimits = new Map()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Solana x402 Learn & Earn API is running',
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

// Reward payout endpoint - Agent sends SOL rewards from treasury
app.post('/api/reward', async (req, res) => {
  try {
    const { walletAddress, amount, moduleId } = req.body

    if (!walletAddress || !amount) {
      return res.status(400).json({
        error: 'Wallet address and amount are required'
      })
    }

    if (!treasuryWallet) {
      return res.status(500).json({
        error: 'Treasury wallet not configured. Cannot send rewards.'
      })
    }

    // Validate wallet address
    let recipientPublicKey
    try {
      recipientPublicKey = new PublicKey(walletAddress)
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid wallet address format'
      })
    }

    // Validate amount (max 0.5 SOL per reward for safety)
    if (amount <= 0 || amount > 0.5) {
      return res.status(400).json({
        error: 'Invalid reward amount. Must be between 0 and 0.5 SOL'
      })
    }

    console.log(`💰 Sending ${amount} SOL reward to ${walletAddress} for Module ${moduleId}`)

    // Create transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryWallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      })
    )

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasuryWallet],
      {
        commitment: 'confirmed'
      }
    )

    console.log(`✅ Reward sent successfully: ${signature}`)

    res.json({
      success: true,
      signature,
      amount,
      message: `Successfully sent ${amount} SOL reward!`
    })

  } catch (error) {
    console.error('Reward payout error:', error)

    if (error.message?.includes('insufficient funds')) {
      return res.status(503).json({
        error: 'Treasury wallet has insufficient funds. Please fund the treasury.'
      })
    }

    res.status(500).json({
      error: error.message || 'Failed to send reward. Please try again.'
    })
  }
})

// =====================================================
// CDP EMBEDDED WALLET ENDPOINTS
// =====================================================

// Create a new embedded wallet via Coinbase CDP v2
app.post('/api/cdp/create-wallet', async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      })
    }

    if (!cdpConfigured || !cdpClient) {
      return res.status(503).json({
        error: 'CDP service not configured. Please add CDP_API_KEY_ID and CDP_API_KEY_SECRET to environment variables on Railway.',
        details: 'See CDP_INTEGRATION_GUIDE.md for setup instructions',
        note: 'CDP_WALLET_SECRET is optional - only needed if CDP wallets need to sign transactions'
      })
    }

    console.log(`🏦 Creating CDP v2 account for user: ${userId}`)

    // Create a Solana account using CDP v2 API
    // Use getOrCreateAccount to reuse existing account if available
    const accountName = `user_${userId}`
    console.log('Creating Solana account with name:', accountName)

    const account = await cdpClient.solana.getOrCreateAccount({
      name: accountName
    })

    console.log('Account created/retrieved successfully')

    // Get the account address
    const solanaAddress = account.address

    console.log('Solana address:', solanaAddress)

    // Store account data (in production, use a secure database)
    const storedData = {
      accountName,
      userId,
      address: solanaAddress,
      network: 'solana-devnet',
      createdAt: new Date().toISOString()
    }

    cdpWalletStore.set(userId, storedData)

    console.log(`✅ CDP v2 account created successfully: ${solanaAddress}`)

    // Auto-fund the wallet from Solana devnet faucet
    console.log('🚰 Auto-funding wallet from devnet faucet...')
    try {
      const publicKey = new PublicKey(solanaAddress)
      const airdropAmount = 1 * LAMPORTS_PER_SOL
      const signature = await connection.requestAirdrop(publicKey, airdropAmount)
      await connection.confirmTransaction(signature, 'confirmed')
      console.log(`✅ Wallet funded with 1 SOL. Signature: ${signature}`)

      res.json({
        success: true,
        wallet: {
          name: accountName,
          address: solanaAddress,
          network: 'solana-devnet',
          funded: true,
          balance: 1.0
        },
        message: 'Embedded wallet created and funded successfully!'
      })
    } catch (fundError) {
      console.warn('⚠️  Failed to auto-fund wallet:', fundError.message)
      // Still return success even if funding fails - user can fund manually
      res.json({
        success: true,
        wallet: {
          name: accountName,
          address: solanaAddress,
          network: 'solana-devnet',
          funded: false,
          balance: 0
        },
        message: 'Embedded wallet created successfully! Please fund it manually.',
        warning: 'Auto-funding failed. You may need to request funds from the faucet.'
      })
    }

  } catch (error) {
    console.error('❌ CDP v2 account creation error:')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data)
    }

    res.status(500).json({
      error: error.message || 'Failed to create embedded wallet. Please try again.',
      errorType: error.name,
      hint: !cdpConfigured ? 'CDP v2 credentials may not be configured correctly' : 'Check server logs for details'
    })
  }
})

// Get wallet details for a user
app.get('/api/cdp/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    if (!cdpConfigured) {
      return res.status(503).json({
        error: 'CDP service not configured.'
      })
    }

    const walletData = cdpWalletStore.get(userId)

    if (!walletData) {
      return res.status(404).json({
        error: 'Wallet not found for this user'
      })
    }

    res.json({
      success: true,
      wallet: {
        id: walletData.walletId,
        address: walletData.address,
        network: walletData.network,
        createdAt: walletData.createdAt
      }
    })

  } catch (error) {
    console.error('CDP wallet fetch error:', error)
    res.status(500).json({
      error: error.message || 'Failed to fetch wallet details.'
    })
  }
})

// Get wallet balance
app.get('/api/cdp/wallet/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params

    const walletData = cdpWalletStore.get(userId)

    if (!walletData) {
      return res.status(404).json({
        error: 'Wallet not found for this user'
      })
    }

    // Get balance from Solana
    const publicKey = new PublicKey(walletData.address)
    const balance = await connection.getBalance(publicKey)

    res.json({
      success: true,
      address: walletData.address,
      balance: balance / LAMPORTS_PER_SOL,
      balanceLamports: balance
    })

  } catch (error) {
    console.error('CDP wallet balance error:', error)
    res.status(500).json({
      error: error.message || 'Failed to fetch wallet balance.'
    })
  }
})

// Export wallet seed phrase (use with caution!)
app.post('/api/cdp/export-wallet', async (req, res) => {
  try {
    const { userId, confirmExport } = req.body

    if (!userId || !confirmExport) {
      return res.status(400).json({
        error: 'User ID and export confirmation required'
      })
    }

    if (!cdpConfigured) {
      return res.status(503).json({
        error: 'CDP service not configured.'
      })
    }

    const walletData = cdpWalletStore.get(userId)

    if (!walletData) {
      return res.status(404).json({
        error: 'Wallet not found for this user'
      })
    }

    console.log(`🔐 Exporting wallet for user: ${userId}`)

    // Return the stored seed (in production, this should be heavily secured)
    res.json({
      success: true,
      walletData: {
        seed: walletData.seed,
        address: walletData.address,
        network: walletData.network
      },
      message: 'Wallet exported successfully. Keep this information secure!',
      warning: '⚠️ Store this seed phrase safely. Anyone with access can control your funds.'
    })

  } catch (error) {
    console.error('CDP wallet export error:', error)
    res.status(500).json({
      error: error.message || 'Failed to export wallet. Please try again.'
    })
  }
})

// Process payment from CDP wallet to treasury
app.post('/api/cdp/send-payment', async (req, res) => {
  try {
    const { userId, amount, recipientAddress } = req.body

    if (!userId || !amount || !recipientAddress) {
      return res.status(400).json({
        error: 'userId, amount, and recipientAddress are required'
      })
    }

    if (!cdpConfigured || !cdpClient) {
      return res.status(503).json({
        error: 'CDP service not configured.'
      })
    }

    if (!process.env.CDP_WALLET_SECRET) {
      return res.status(503).json({
        error: 'CDP_WALLET_SECRET not configured. Required to sign transactions from CDP wallets.',
        hint: 'Add CDP_WALLET_SECRET to Railway environment variables to enable embedded wallet payments'
      })
    }

    const walletData = cdpWalletStore.get(userId)

    if (!walletData) {
      return res.status(404).json({
        error: 'Wallet not found for this user. Please create a wallet first.'
      })
    }

    console.log(`💸 Processing payment from CDP wallet for user: ${userId}`)
    console.log(`Amount: ${amount} SOL to ${recipientAddress}`)

    // Get the CDP account
    const account = await cdpClient.solana.getOrCreateAccount({
      name: walletData.accountName
    })

    console.log('Account retrieved, initiating transfer...')

    // Transfer SOL using CDP's built-in transfer method
    const transfer = await account.transfer({
      to: recipientAddress,
      amount: amount,
      token: 'sol'
    })

    console.log('Transfer initiated, waiting for confirmation...')

    // Wait for transaction confirmation
    const signature = transfer.getTransactionHash()

    console.log(`✅ Payment successful! Signature: ${signature}`)

    res.json({
      success: true,
      signature,
      amount,
      from: walletData.address,
      to: recipientAddress,
      message: 'Payment processed successfully!'
    })

  } catch (error) {
    console.error('❌ CDP payment error:')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data)
    }

    res.status(500).json({
      error: error.message || 'Failed to process payment. Please try again.',
      errorType: error.name,
      hint: 'Check that wallet has sufficient balance and CDP_WALLET_SECRET is configured'
    })
  }
})

// =====================================================
// END CDP ENDPOINTS
// =====================================================

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

    // Add system message for Solana x402 learning
    const systemMessage = {
      role: 'system',
      content: `You are a knowledgeable and supportive Solana x402 AI learning assistant. Your role is to:
- Help users learn about Solana x402 AI agents and blockchain technology
- Evaluate user responses to learning module questions
- Provide helpful hints when users struggle with questions
- Keep responses clear, educational, and encouraging
- Ask follow-up questions to gauge understanding
- Encourage continued learning and exploration of Solana x402
- Keep responses concise and focused on the learning objectives
- Be supportive and constructive with feedback`
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
  console.log(`Solana x402 Learn & Earn Backend running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log(`OpenAI configured: ${!!process.env.OPENAI_API_KEY}`)

  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY not set in environment variables')
  }
})

export default app
