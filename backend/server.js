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

// Initialize OpenAI (fallback provider)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Gradient Cloud API Configuration
const GRADIENT_API_KEY = process.env.GRADIENT_API_KEY
const GRADIENT_API_ENDPOINT = process.env.GRADIENT_API_ENDPOINT || 'https://apis.gradient.network/api/v1/ai'
const GRADIENT_MODEL = process.env.GRADIENT_MODEL || 'openai/gpt-oss-120b'
const USE_GRADIENT_PRIMARY = process.env.USE_GRADIENT_PRIMARY !== 'false' // Default: enabled

console.log('\n🔧 AI Provider Configuration:')
console.log(`  Gradient Cloud: ${GRADIENT_API_KEY ? '✅ Enabled' : '❌ Disabled (no API key)'}`)
console.log(`  OpenAI Fallback: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
if (GRADIENT_API_KEY) {
  console.log(`  Gradient Model: ${GRADIENT_MODEL}`)
  console.log(`  Gradient Endpoint: ${GRADIENT_API_ENDPOINT}`)
  console.log(`  Use as Primary: ${USE_GRADIENT_PRIMARY}`)
}
console.log('🔧 AI Provider Configuration Complete\n')

// Helper function to parse text responses into structured function calls
// This is a fallback when the AI model doesn't support function calling
function parseTextResponseToFunctionCall(content, functions) {
  console.log('🔍 Parsing text response into function call format...')
  console.log('Content to parse:', content)

  // Try to extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      // Check if it looks like an evaluation response
      if ('passed' in parsed || 'score' in parsed) {
        console.log('✅ Found JSON evaluation in text:', parsed)
        return {
          name: 'evaluate_answer',
          arguments: JSON.stringify({
            passed: parsed.passed ?? false,
            score: parsed.score ?? 0,
            feedback: parsed.feedback || content.substring(0, 200)
          })
        }
      }
    } catch (e) {
      console.log('JSON parse attempt failed:', e.message)
    }
  }

  // Fallback: Intelligent text analysis
  const contentLower = content.toLowerCase()

  // Determine if answer passed
  const passIndicators = ['correct', 'pass', 'good', 'yes', 'right', 'excellent', 'great', 'well done']
  const failIndicators = ['incorrect', 'fail', 'no', 'wrong', 'not quite', 'missing', 'insufficient']

  const hasPassIndicator = passIndicators.some(word => contentLower.includes(word))
  const hasFailIndicator = failIndicators.some(word => contentLower.includes(word))

  // Default to passing if unclear (lenient evaluation for hackathon demo)
  const passed = hasPassIndicator || (!hasFailIndicator && contentLower.length > 10)

  // Extract score if mentioned
  let score = 0
  const scoreMatch = content.match(/score[:\s]+(\d+)/i) || content.match(/(\d+)\s*\/\s*100/)
  if (scoreMatch) {
    score = parseInt(scoreMatch[1])
  } else {
    // Estimate score based on sentiment
    score = passed ? 75 : 35
  }

  console.log(`📊 Parsed evaluation: passed=${passed}, score=${score}`)

  return {
    name: 'evaluate_answer',
    arguments: JSON.stringify({
      passed,
      score,
      feedback: content.trim().substring(0, 200) // Use first 200 chars as feedback
    })
  }
}

// Dual-Provider AI Completion Function
// Tries Gradient Cloud first, falls back to OpenAI on any error
async function callAIProvider(messages, options = {}) {
  const { temperature = 0.3, max_tokens = 200, functions, function_call } = options

  // Try Gradient Cloud first (if enabled and configured)
  if (USE_GRADIENT_PRIMARY && GRADIENT_API_KEY) {
    try {
      console.log(`🟣 Attempting Gradient Cloud inference (${GRADIENT_MODEL})...`)
      const startTime = Date.now()

      // Build request body with function calling support
      const requestBody = {
        model: GRADIENT_MODEL,
        messages,
        temperature,
        max_tokens,
        stream: false // Disable streaming for cleaner responses
      }

      // Add function calling if provided (Gradient may or may not support this)
      if (functions) {
        requestBody.functions = functions
        requestBody.function_call = function_call || 'auto'
        console.log('📎 Including function calling in Gradient request')
      }

      console.log('📤 Gradient request:', JSON.stringify({
        ...requestBody,
        messages: messages.map(m => ({ role: m.role, content: m.content?.substring(0, 100) + '...' }))
      }, null, 2))

      const response = await fetch(`${GRADIENT_API_ENDPOINT}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GRADIENT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gradient API error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const latency = Date.now() - startTime

      console.log(`✅ Gradient Cloud succeeded (${latency}ms)`)
      console.log('📥 Gradient response structure:', JSON.stringify({
        hasChoices: !!data.choices,
        messageKeys: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : [],
        hasFunctionCall: !!data.choices?.[0]?.message?.function_call,
        hasContent: !!data.choices?.[0]?.message?.content
      }))

      // Check if response has function_call (native function calling support)
      const message = data.choices?.[0]?.message || data.message

      if (message?.function_call) {
        console.log('✅ Gradient returned native function_call')
        // Native function calling worked!
        return {
          data: {
            choices: data.choices || [{ message: data.message }],
            usage: data.usage
          },
          provider: 'gradient',
          model: GRADIENT_MODEL,
          latency
        }
      } else if (message?.content && functions) {
        console.log('⚙️ Gradient returned text content, parsing into function_call...')
        // No function_call, but we have content - parse it intelligently
        const parsedFunctionCall = parseTextResponseToFunctionCall(message.content, functions)

        // Inject the parsed function call into the response
        return {
          data: {
            choices: [{
              message: {
                role: 'assistant',
                content: message.content,
                function_call: parsedFunctionCall
              }
            }],
            usage: data.usage
          },
          provider: 'gradient',
          model: GRADIENT_MODEL,
          latency,
          parsed: true // Flag to indicate we parsed the response
        }
      } else {
        console.log('✅ Gradient returned standard response (no function calling needed)')
        // Standard response without function calling
        return {
          data: {
            choices: data.choices || [{ message: data.message }],
            usage: data.usage
          },
          provider: 'gradient',
          model: GRADIENT_MODEL,
          latency
        }
      }

    } catch (gradientError) {
      console.warn(`⚠️  Gradient Cloud failed: ${gradientError.message}`)
      console.warn(`⚠️  Falling back to OpenAI...`)
      // Fall through to OpenAI
    }
  }

  // Fallback to OpenAI
  try {
    console.log('🔵 Using OpenAI inference (fallback)...')
    const startTime = Date.now()

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens,
      functions,
      function_call
    })

    const latency = Date.now() - startTime
    console.log(`✅ OpenAI succeeded (${latency}ms)`)

    return {
      data: completion,
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      latency
    }

  } catch (openaiError) {
    console.error('❌ OpenAI also failed:', openaiError.message)
    throw new Error(`All AI providers failed. Last error: ${openaiError.message}`)
  }
}

// Usage logging for analytics
const usageLogs = []

function logEvaluation({ provider, model, latency, success, moduleId, walletAddress }) {
  const log = {
    timestamp: new Date().toISOString(),
    provider,
    model,
    latency,
    success,
    moduleId,
    wallet: walletAddress ? walletAddress.slice(0, 8) + '...' : 'unknown'
  }

  usageLogs.push(log)
  console.log('📊 Evaluation logged:', JSON.stringify(log))

  // Keep only last 1000 logs in memory
  if (usageLogs.length > 1000) {
    usageLogs.shift()
  }
}

function getUsageStats() {
  if (usageLogs.length === 0) {
    return {
      total: 0,
      message: 'No evaluations logged yet'
    }
  }

  const gradientCount = usageLogs.filter(l => l.provider === 'gradient').length
  const openaiCount = usageLogs.filter(l => l.provider === 'openai').length
  const avgLatency = usageLogs.reduce((sum, l) => sum + l.latency, 0) / usageLogs.length

  return {
    total: usageLogs.length,
    providers: {
      gradient: gradientCount,
      openai: openaiCount
    },
    fallbackRate: usageLogs.length > 0 ? ((openaiCount / usageLogs.length) * 100).toFixed(1) + '%' : '0%',
    avgLatency: avgLatency.toFixed(0) + 'ms',
    recentLogs: usageLogs.slice(-10)
  }
}

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
// NOTE: CDP_WALLET_SECRET should NOT be set - CDP v2 manages wallet secrets internally
let cdpClient = null
let cdpConfigured = false
let cdpInitError = null

console.log('\n🔧 CDP SDK v2 Initialization Starting...')
console.log('Environment Variables Check:')
console.log('  CDP_API_KEY_ID:', process.env.CDP_API_KEY_ID ? `✅ Set (${process.env.CDP_API_KEY_ID.substring(0, 8)}...)` : '❌ Missing')
console.log('  CDP_API_KEY_SECRET:', process.env.CDP_API_KEY_SECRET ? `✅ Set (${process.env.CDP_API_KEY_SECRET.substring(0, 8)}...)` : '❌ Missing')
if (process.env.CDP_WALLET_SECRET) {
  console.warn('  ⚠️  CDP_WALLET_SECRET is set - this WILL cause errors!')
  console.warn('  ⚠️  For CDP v2, DELETE this variable and let CDP manage wallet secrets internally')
}

if (process.env.CDP_API_KEY_ID && process.env.CDP_API_KEY_SECRET) {
  try {
    // Initialize CDP v2 client with ONLY API credentials
    // Do NOT pass walletSecret - CDP v2 manages this internally
    const cdpConfig = {
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET
    }

    console.log('🔄 Creating CdpClient instance (CDP v2 will manage wallet secrets internally)...')
    cdpClient = new CdpClient(cdpConfig)
    cdpConfigured = true
    console.log('✅ Coinbase CDP SDK v2 initialized successfully!')
  } catch (error) {
    cdpInitError = error
    console.error('❌ Failed to initialize CDP SDK v2:')
    console.error('   Error Type:', error.name)
    console.error('   Error Message:', error.message)
    console.error('   Stack Trace:', error.stack)
    if (error.response) {
      console.error('   API Response:', JSON.stringify(error.response.data, null, 2))
    }
    console.warn('⚠️  CDP embedded wallets will not be available')
  }
} else {
  console.warn('❌ CDP v2 credentials not configured.')
  console.warn('Required environment variables:')
  console.warn('  - CDP_API_KEY_ID: Your CDP API key ID (REQUIRED)')
  console.warn('  - CDP_API_KEY_SECRET: Your CDP API key secret (REQUIRED)')
  console.warn('\nGet API credentials from: https://portal.cdp.coinbase.com/')
  console.warn('\n⚠️  DO NOT set CDP_WALLET_SECRET - CDP v2 manages wallet secrets internally')
}
console.log('🔧 CDP SDK v2 Initialization Complete\n')

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
    gradientConfigured: !!GRADIENT_API_KEY,
    solanaConnected: true
  })
})

// Usage statistics endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    ...getUsageStats(),
    timestamp: new Date().toISOString()
  })
})

// X402 Payment Required Endpoint
// Returns HTTP 402 with x402 protocol headers when payment is required
app.post('/api/x402/verify-access', async (req, res) => {
  const { walletAddress, hasPaid } = req.body

  console.log('🔐 X402 Access Verification:', { walletAddress, hasPaid })

  if (!hasPaid) {
    // Return HTTP 402 Payment Required with x402 protocol headers
    res.status(402)
      .header('X-Payment-Required', 'true')
      .header('X-Payment-Amount', '0.033 SOL')
      .header('X-Payment-Recipient', process.env.TREASURY_WALLET || 'treasury')
      .header('X-Payment-Network', 'solana-devnet')
      .header('X-Payment-Description', 'Access to Solana x402 Learn & Earn Platform')
      .json({
        error: 'Payment Required',
        statusCode: 402,
        message: 'HTTP 402: Payment Required to access this resource',
        paymentDetails: {
          amount: '0.033 SOL',
          recipient: process.env.TREASURY_WALLET || 'treasury',
          network: 'solana-devnet',
          description: 'Unlock 3 learning modules about Solana x402 AI agents'
        }
      })
  } else {
    // Payment verified - return 200 with verification header
    res.status(200)
      .header('X-Payment-Verified', 'true')
      .header('X-Access-Granted', 'true')
      .json({
        success: true,
        message: 'Access granted',
        accessLevel: 'full'
      })
  }
})

// CDP Configuration Test Endpoint
app.get('/api/cdp/test', (req, res) => {
  console.log('\n🧪 CDP Configuration Test Requested')

  const envVarsStatus = {
    CDP_API_KEY_ID: {
      present: !!process.env.CDP_API_KEY_ID,
      preview: process.env.CDP_API_KEY_ID ? `${process.env.CDP_API_KEY_ID.substring(0, 8)}...` : null
    },
    CDP_API_KEY_SECRET: {
      present: !!process.env.CDP_API_KEY_SECRET,
      preview: process.env.CDP_API_KEY_SECRET ? `${process.env.CDP_API_KEY_SECRET.substring(0, 8)}...` : null
    },
    CDP_WALLET_SECRET: {
      present: !!process.env.CDP_WALLET_SECRET,
      preview: process.env.CDP_WALLET_SECRET ? `${process.env.CDP_WALLET_SECRET.substring(0, 8)}...` : null
    }
  }

  const testResult = {
    timestamp: new Date().toISOString(),
    environmentVariables: envVarsStatus,
    cdpClientInitialized: cdpConfigured,
    cdpClientObject: cdpClient ? 'Present' : 'Null',
    initializationError: cdpInitError ? {
      type: cdpInitError.name,
      message: cdpInitError.message,
      stack: cdpInitError.stack
    } : null,
    status: cdpConfigured ? 'READY' : 'NOT_CONFIGURED',
    issues: []
  }

  // Identify issues
  if (!envVarsStatus.CDP_API_KEY_ID.present) {
    testResult.issues.push('CDP_API_KEY_ID is missing')
  }
  if (!envVarsStatus.CDP_API_KEY_SECRET.present) {
    testResult.issues.push('CDP_API_KEY_SECRET is missing')
  }
  if (envVarsStatus.CDP_WALLET_SECRET.present) {
    testResult.issues.push('⚠️ CDP_WALLET_SECRET is set but should NOT be! DELETE this variable - CDP v2 manages wallet secrets internally')
  }
  if (cdpInitError) {
    testResult.issues.push(`Initialization failed: ${cdpInitError.message}`)
  }

  console.log('CDP Test Result:', JSON.stringify(testResult, null, 2))

  res.json(testResult)
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

    // Check if treasury wallet is configured
    if (!treasuryWallet) {
      return res.status(500).json({
        error: 'Faucet not available. Treasury wallet not configured.'
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

    // Rate limiting: 1 airdrop per wallet per 10 minutes (reduced from 1 hour)
    const now = Date.now()
    const lastRequest = faucetRateLimits.get(walletAddress)
    const TEN_MINUTES = 10 * 60 * 1000

    if (lastRequest && (now - lastRequest) < TEN_MINUTES) {
      const timeLeft = Math.ceil((TEN_MINUTES - (now - lastRequest)) / 1000 / 60)
      return res.status(429).json({
        error: `Rate limit exceeded. Please try again in ${timeLeft} minute${timeLeft !== 1 ? 's' : ''}.`
      })
    }

    // Send SOL from treasury wallet (0.1 SOL - enough for testing)
    console.log(`🚰 Sending 0.1 SOL from treasury to ${walletAddress}`)
    const airdropAmount = 0.1 * LAMPORTS_PER_SOL

    // Create transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryWallet.publicKey,
        toPubkey: publicKey,
        lamports: Math.floor(airdropAmount),
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

    // Update rate limit
    faucetRateLimits.set(walletAddress, now)

    console.log(`✅ Faucet airdrop successful: ${signature}`)

    res.json({
      success: true,
      signature,
      amount: 0.1,
      message: 'Successfully airdropped 0.1 SOL to your wallet!'
    })

  } catch (error) {
    console.error('Faucet error:', error)

    // Handle specific errors
    if (error.message?.includes('insufficient funds')) {
      return res.status(503).json({
        error: 'Treasury wallet has insufficient funds. Please contact support.'
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
        note: 'Do NOT set CDP_WALLET_SECRET - CDP v2 manages wallet secrets internally'
      })
    }

    console.log(`\n🏦 Creating CDP v2 account for user: ${userId}`)
    console.log('CDP Client Status:', cdpClient ? '✅ Available' : '❌ Not available')
    console.log('CDP Configured:', cdpConfigured)

    // Create a Solana account using CDP v2 API
    // Use getOrCreateAccount to reuse existing account if available
    // CDP requires: alphanumeric and hyphens only, 2-36 chars (no underscores!)
    const accountName = userId.replace(/_/g, '-')
    console.log('📝 Account name:', accountName)
    console.log('🔄 Calling cdpClient.solana.getOrCreateAccount()...')

    let account
    try {
      account = await cdpClient.solana.getOrCreateAccount({
        name: accountName
      })
      console.log('✅ Account created/retrieved successfully')
      console.log('   Account object type:', typeof account)
      console.log('   Account keys:', account ? Object.keys(account) : 'null')
    } catch (accountError) {
      console.error('❌ Account creation failed:')
      console.error('   Error Type:', accountError.name)
      console.error('   Error Message:', accountError.message)
      console.error('   Error Code:', accountError.code)
      console.error('   Full error:', JSON.stringify(accountError, null, 2))
      throw accountError
    }

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
      console.warn('⚠️  Failed to auto-fund wallet from faucet:', fundError.message)
      console.log('💰 Attempting backup funding from treasury wallet...')

      // Try to fund from treasury wallet as backup
      if (treasuryWallet) {
        try {
          const recipientPublicKey = new PublicKey(solanaAddress)
          const fundingAmount = 0.1 * LAMPORTS_PER_SOL  // Fund with 0.1 SOL (enough for 2 test cycles)

          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: treasuryWallet.publicKey,
              toPubkey: recipientPublicKey,
              lamports: Math.floor(fundingAmount),
            })
          )

          const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [treasuryWallet]
          )

          console.log(`✅ Wallet funded from treasury with 0.1 SOL. Signature: ${signature}`)

          res.json({
            success: true,
            wallet: {
              name: accountName,
              address: solanaAddress,
              network: 'solana-devnet',
              funded: true,
              balance: 0.1,
              fundingSource: 'treasury'
            },
            message: 'Embedded wallet created and funded from treasury successfully!',
            signature: signature
          })
        } catch (treasuryError) {
          console.error('❌ Treasury funding also failed:', treasuryError.message)
          // Both faucet and treasury failed - return unfunded
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
            warning: 'Auto-funding failed (faucet and treasury). You may need to request funds from the faucet manually or reduce payment amounts for testing.'
          })
        }
      } else {
        // No treasury wallet configured - return unfunded
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
          warning: 'Auto-funding failed. Treasury wallet not configured. You may need to request funds from the faucet.'
        })
      }
    }

  } catch (error) {
    console.error('\n❌ CDP v2 account creation error:')
    console.error('   Error name:', error.name)
    console.error('   Error message:', error.message)
    console.error('   Error code:', error.code)
    console.error('   Error stack:', error.stack)
    if (error.response) {
      console.error('   API Response Status:', error.response.status)
      console.error('   API Response Data:', JSON.stringify(error.response.data, null, 2))
    }
    if (error.cause) {
      console.error('   Error cause:', error.cause)
    }

    // Build detailed error response
    const errorResponse = {
      error: error.message || 'Failed to create embedded wallet',
      errorType: error.name,
      errorCode: error.code,
      timestamp: new Date().toISOString(),
      hints: []
    }

    // Add specific hints based on error type
    if (error.message?.includes('Wallet Secret')) {
      errorResponse.hints.push('Error mentions "Wallet Secret" - CDP_WALLET_SECRET should NOT be set!')
      errorResponse.hints.push('DELETE CDP_WALLET_SECRET from Railway environment variables')
      errorResponse.hints.push('CDP v2 manages wallet secrets internally - manual secrets cause errors')
    } else if (error.message?.includes('API key')) {
      errorResponse.hints.push('Check that CDP_API_KEY_ID and CDP_API_KEY_SECRET are correct')
      errorResponse.hints.push('Verify credentials at https://portal.cdp.coinbase.com/')
    } else if (!cdpConfigured) {
      errorResponse.hints.push('CDP is not properly configured')
      errorResponse.hints.push('Visit /api/cdp/test to diagnose the issue')
    } else {
      errorResponse.hints.push('Check Railway logs for detailed error information')
      errorResponse.hints.push('Visit /api/cdp/test to verify configuration')
    }

    res.status(500).json(errorResponse)
  }
})

// Get wallet details for a user
app.get('/api/cdp/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    if (!cdpConfigured || !cdpClient) {
      return res.status(503).json({
        error: 'CDP service not configured.'
      })
    }

    // First, check in-memory store
    let walletData = cdpWalletStore.get(userId)

    // If not in memory (e.g., server restarted), fetch from CDP
    if (!walletData) {
      console.log(`📦 Wallet not in memory for ${userId}, fetching from CDP...`)

      try {
        // CDP requires: alphanumeric and hyphens only, 2-36 chars (no underscores!)
        const accountName = userId.replace(/_/g, '-')
        console.log(`🔄 Calling getOrCreateAccount with name: ${accountName}`)

        const account = await cdpClient.solana.getOrCreateAccount({
          name: accountName
        })

        console.log(`✅ Account retrieved from CDP: ${account.address}`)

        // Rebuild wallet data
        walletData = {
          accountName,
          userId,
          address: account.address,
          network: 'solana-devnet',
          createdAt: new Date().toISOString()
        }

        // Store back in memory for future requests
        cdpWalletStore.set(userId, walletData)
        console.log(`💾 Wallet data cached in memory for future requests`)
      } catch (cdpError) {
        console.error('❌ Failed to restore wallet from CDP:', cdpError)
        console.error('   Error Type:', cdpError.name)
        console.error('   Error Message:', cdpError.message)

        return res.status(404).json({
          error: 'Wallet not found and could not be restored from CDP',
          hint: 'Please create a new wallet',
          technical: cdpError.message
        })
      }
    }

    res.json({
      success: true,
      wallet: {
        name: walletData.accountName,
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

    // Convert SOL amount to lamports (integer) to avoid BigInt conversion errors
    // CDP SDK expects amounts in the token's smallest unit
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL)
    console.log(`Converting ${amount} SOL to ${lamports} lamports`)

    // Transfer SOL using CDP's built-in transfer method
    // Network parameter is required - can be "devnet" or a Connection object
    const transfer = await account.transfer({
      to: recipientAddress,
      amount: lamports,
      token: 'sol',
      network: connection  // Pass our Solana connection object for devnet
    })

    console.log('Transfer initiated, waiting for confirmation...')

    // CDP SDK v2 for Solana returns signature directly, not via getTransactionHash()
    // Solana uses signatures as transaction identifiers (not hashes like EVM)
    const signature = transfer.signature

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
      hint: 'Check that wallet has sufficient balance and is connected to the correct network'
    })
  }
})

// =====================================================
// END CDP ENDPOINTS
// =====================================================

// AI Agent Evaluation Endpoint with Function Calling
// The AI autonomously evaluates answers and makes payment decisions
app.post('/api/evaluate-with-ai', async (req, res) => {
  try {
    const { userAnswer, moduleId, walletAddress, question, expectedConcepts, lessonContext } = req.body

    console.log('\n🤖 ========== AI EVALUATION REQUEST ==========')
    console.log('  Module ID:', moduleId)
    console.log('  Wallet:', walletAddress)
    console.log('  Question:', question)
    console.log('  User Answer:', userAnswer)
    console.log('  Expected Concepts:', expectedConcepts)
    console.log('  OpenAI Key Present:', !!process.env.OPENAI_API_KEY)
    console.log('=============================================\n')

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key NOT configured!')
      return res.status(500).json({
        error: 'OpenAI API key not configured.',
        fallbackAvailable: true
      })
    }

    if (!userAnswer || !walletAddress) {
      console.error('❌ Missing required fields')
      return res.status(400).json({
        error: 'User answer and wallet address are required.'
      })
    }

    console.log(`🤖 AI Agent evaluating Module ${moduleId} answer for ${walletAddress}`)

    // Define functions the AI agent can call
    const functions = [
      {
        name: 'evaluate_answer',
        description: 'Evaluate if a learning answer demonstrates understanding of key concepts',
        parameters: {
          type: 'object',
          properties: {
            passed: {
              type: 'boolean',
              description: 'Whether the answer demonstrates sufficient understanding to pass'
            },
            score: {
              type: 'number',
              description: 'Quality score from 0-100 based on completeness and accuracy'
            },
            feedback: {
              type: 'string',
              description: 'Constructive feedback for the learner (1-2 sentences)'
            }
          },
          required: ['passed', 'score', 'feedback']
        }
      },
      {
        name: 'send_payment',
        description: 'Send SOL reward to the learner if they passed',
        parameters: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'SOL amount to send (base: 0.011)'
            },
            reason: {
              type: 'string',
              description: 'Brief reason for the payment decision'
            }
          },
          required: ['amount', 'reason']
        }
      }
    ]

    // System prompt for the AI agent
    const systemPrompt = `You are an AI agent that evaluates learning answers and autonomously makes payment decisions.

EVALUATION CRITERIA:
- Be VERY LENIENT - this is for hackathon demo, not a strict exam
- Does the answer show ANY understanding of the concept?
- Accept answers that mention key concepts even if not perfectly explained
- Accept answers that are close to correct or show the right direction
- ONLY FAIL if answer is completely off-topic or nonsensical
- If unsure, PASS the student

PAYMENT DECISIONS:
- Base reward: 0.011 SOL per module
- If score >= 40: MUST call send_payment with 0.011 SOL
- If score < 40: Do NOT call send_payment (only for completely wrong answers)

WORKFLOW:
1. Call evaluate_answer() to assess the response
2. If passed (score >= 40), immediately call send_payment() with 0.011 SOL
3. Be encouraging and supportive in feedback

Question: "${question}"
Expected concepts: ${expectedConcepts?.join(', ')}

Evaluate generously and decide autonomously.`

    const userPrompt = `Student's answer: "${userAnswer}"`

    console.log('📞 Calling AI Provider (Gradient Cloud → OpenAI fallback)...')
    console.log('  Temperature: 0.3')
    console.log('  Max Tokens: 200')

    // Call AI provider (tries Gradient first, falls back to OpenAI)
    const { data: completion, provider, model, latency, parsed } = await callAIProvider(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        functions: functions,
        function_call: 'auto',
        temperature: 0.3,
        max_tokens: 200
      }
    )

    console.log(`✅ AI evaluation completed by ${provider} (${model}) in ${latency}ms`)
    const responseMessage = completion.choices[0].message
    console.log('🤖 AI response:', JSON.stringify(responseMessage, null, 2))

    // Process function calls
    let evaluation = null
    let paymentResult = null

    // Handle function calls (can be multiple)
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name
      const functionArgs = JSON.parse(responseMessage.function_call.arguments)

      console.log(`AI called function: ${functionName}`, functionArgs)

      if (functionName === 'evaluate_answer') {
        evaluation = functionArgs

        // PERFORMANCE OPTIMIZATION: If response was parsed from text (Gradient fallback),
        // skip the second AI call and directly execute payment
        // This cuts latency in half (~3.5s -> ~2.5s)
        if (evaluation.passed && parsed) {
          console.log(`💰 Student passed! Parsed response detected - directly executing payment (skipping second AI call)`)

          // Directly execute payment without second AI call
          try {
            if (!treasuryWallet) {
              throw new Error('Treasury wallet not configured')
            }

            const recipientPublicKey = new PublicKey(walletAddress)
            const transaction = new Transaction().add(
              SystemProgram.transfer({
                fromPubkey: treasuryWallet.publicKey,
                toPubkey: recipientPublicKey,
                lamports: Math.floor(0.011 * LAMPORTS_PER_SOL), // Base reward
              })
            )

            const signature = await sendAndConfirmTransaction(
              connection,
              transaction,
              [treasuryWallet],
              { commitment: 'confirmed' }
            )

            console.log(`✅ Direct payment sent: 0.011 SOL. Signature: ${signature}`)

            paymentResult = {
              success: true,
              signature,
              amount: 0.011,
              reason: 'Passed evaluation'
            }
          } catch (paymentError) {
            console.error('Payment execution error:', paymentError)
            paymentResult = {
              success: false,
              error: paymentError.message
            }
          }
        }
        // If passed and NOT parsed (native function calling), make second AI call
        else if (evaluation.passed && !parsed) {
          console.log(`💰 Student passed! Calling ${provider} again for payment decision...`)
          const { data: secondCompletion } = await callAIProvider(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
              responseMessage,
              {
                role: 'function',
                name: 'evaluate_answer',
                content: JSON.stringify({ success: true, evaluation })
              }
            ],
            {
              functions: functions,
              function_call: 'auto',
              temperature: 0.3,
              max_tokens: 200
            }
          )

          console.log('✅ AI payment decision received!')
          const secondResponse = secondCompletion.choices[0].message
          console.log('💸 AI second response:', JSON.stringify(secondResponse, null, 2))

          if (secondResponse.function_call && secondResponse.function_call.name === 'send_payment') {
            const paymentArgs = JSON.parse(secondResponse.function_call.arguments)

            // Execute the actual payment
            try {
              if (!treasuryWallet) {
                throw new Error('Treasury wallet not configured')
              }

              const recipientPublicKey = new PublicKey(walletAddress)
              const transaction = new Transaction().add(
                SystemProgram.transfer({
                  fromPubkey: treasuryWallet.publicKey,
                  toPubkey: recipientPublicKey,
                  lamports: Math.floor(paymentArgs.amount * LAMPORTS_PER_SOL),
                })
              )

              const signature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [treasuryWallet],
                { commitment: 'confirmed' }
              )

              console.log(`✅ AI Agent sent ${paymentArgs.amount} SOL. Signature: ${signature}`)

              paymentResult = {
                success: true,
                signature,
                amount: paymentArgs.amount,
                reason: paymentArgs.reason
              }
            } catch (paymentError) {
              console.error('Payment execution error:', paymentError)
              paymentResult = {
                success: false,
                error: paymentError.message
              }
            }
          }
        }
      }
    }

    // Log evaluation for analytics
    logEvaluation({
      provider,
      model,
      latency,
      success: evaluation?.passed || false,
      moduleId,
      walletAddress
    })

    // Return evaluation and payment result
    const response = {
      aiEvaluated: true,
      passed: evaluation?.passed || false,
      score: evaluation?.score || 0,
      feedback: evaluation?.feedback || 'Unable to evaluate answer.',
      payment: paymentResult,
      moduleId,
      provider,  // Include provider info in response
      model      // Include model info in response
    }

    console.log('\n✅ ========== SENDING RESPONSE ==========')
    console.log(JSON.stringify(response, null, 2))
    console.log('========================================\n')

    res.json(response)

  } catch (error) {
    console.error('\n❌ ========== AI EVALUATION ERROR ==========')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('===========================================\n')

    // Return error with fallback flag
    res.status(500).json({
      error: error.message || 'AI evaluation failed',
      fallbackAvailable: true,
      aiEvaluated: false
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
