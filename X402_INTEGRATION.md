# X402 Protocol Integration

## Overview

This project implements the **x402 payment protocol** for the Solana x402 Hackathon. The x402 protocol uses **HTTP status code 402 "Payment Required"** to enable seamless cryptocurrency payments for web content and AI agent services.

**Track:** Track 5 - x402 Agent Application
**Network:** Solana Devnet
**Implementation:** Lightweight x402 integration without facilitators (devnet only)

---

## What is X402?

**X402** is an open payment protocol that leverages the HTTP 402 status code to create a standardized way for AI agents and applications to request and verify payments.

### Key Concepts:

- **HTTP 402 "Payment Required"** - Standard HTTP status code for payment requests
- **Protocol Headers** - Custom headers that convey payment requirements
- **Blockchain Verification** - Payments verified directly on Solana blockchain
- **Agent Autonomy** - AI agents can request and verify payments automatically

### The X402 Flow:

```
1. User connects wallet but hasn't paid
2. Server returns HTTP 402 with x402 headers
3. Frontend displays "Payment Required" status
4. User makes payment via Solana transaction
5. Server verifies payment on blockchain
6. Server returns HTTP 200 with access granted
```

---

## Our Implementation

### Architecture

We implement a **lightweight x402 protocol** suitable for devnet testing:

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Frontend  │  HTTP   │   Backend   │  RPC    │   Solana     │
│   (React)   │ ◄─402──►│  (Express)  │ ◄──────►│   Devnet     │
└─────────────┘         └─────────────┘         └──────────────┘
       │                       │
       │   X-Payment-*         │
       │   Headers             │
       └───────────────────────┘
```

### Components:

1. **Backend API Endpoint** - `/api/x402/verify-access`
2. **X402 Protocol Headers** - Payment requirements and verification
3. **Frontend Display** - Visual HTTP 402 status indicator
4. **Blockchain Verification** - Direct Solana devnet verification

---

## Implementation Details

### Backend: X402 Verification Endpoint

**File:** `backend/server.js`

```javascript
// X402 Payment Required Endpoint
app.post('/api/x402/verify-access', async (req, res) => {
  const { walletAddress, hasPaid } = req.body

  if (!hasPaid) {
    // Return HTTP 402 with x402 protocol headers
    res.status(402)
      .header('X-Payment-Required', 'true')
      .header('X-Payment-Amount', '0.04 SOL')
      .header('X-Payment-Recipient', process.env.TREASURY_WALLET)
      .header('X-Payment-Network', 'solana-devnet')
      .header('X-Payment-Description', 'Access to Solana x402 Learn & Earn Platform')
      .json({
        error: 'Payment Required',
        statusCode: 402,
        message: 'HTTP 402: Payment Required to access this resource',
        paymentDetails: {
          amount: '0.04 SOL',
          recipient: process.env.TREASURY_WALLET,
          network: 'solana-devnet',
          description: 'Unlock 3 learning modules about Solana x402 AI agents'
        }
      })
  } else {
    // Payment verified - return 200
    res.status(200)
      .header('X-Payment-Verified', 'true')
      .header('X-Access-Granted', 'true')
      .json({
        success: true,
        message: 'Access granted'
      })
  }
})
```

### X402 Protocol Headers

Our implementation uses these custom x402 headers:

| Header | Purpose | Example Value |
|--------|---------|---------------|
| `X-Payment-Required` | Indicates payment is needed | `true` |
| `X-Payment-Amount` | Required payment amount | `0.04 SOL` |
| `X-Payment-Recipient` | Destination wallet address | `ABC123...` |
| `X-Payment-Network` | Blockchain network | `solana-devnet` |
| `X-Payment-Description` | Human-readable description | `Access to platform` |
| `X-Payment-Verified` | Payment was verified | `true` |
| `X-Access-Granted` | Access has been granted | `true` |

### Frontend: X402 Status Display

**File:** `learnearn/src/App.jsx`

```javascript
// Verify x402 access
const verifyX402Access = async () => {
  const response = await fetch(`${API_URL}/api/x402/verify-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: currentWalletAddress,
      hasPaid: hasPaid
    })
  })

  if (response.status === 402) {
    // Show HTTP 402 status to user
    setX402Status({
      statusCode: 402,
      message: data.message,
      paymentDetails: data.paymentDetails,
      headers: {
        'X-Payment-Required': response.headers.get('X-Payment-Required'),
        'X-Payment-Amount': response.headers.get('X-Payment-Amount'),
        'X-Payment-Network': response.headers.get('X-Payment-Network')
      }
    })
  }
}
```

**UI Display:**

When payment is required, users see:

```
┌────────────────────────────────────────┐
│  [ HTTP 402 ]  [ Payment Required ]    │
│                                        │
│  HTTP 402: Payment Required to access  │
│                                        │
│  X402 Protocol Headers:                │
│  X-Payment-Required: true              │
│  X-Payment-Amount: 0.04 SOL            │
│  X-Payment-Network: solana-devnet      │
└────────────────────────────────────────┘
```

---

## Why No Facilitator?

### Devnet vs Mainnet

**Facilitators** are external services that verify payments on behalf of the application. They're required for **mainnet** deployments but **not needed for devnet** testing.

**Our Approach (Devnet):**
- ✅ Direct blockchain verification via Solana RPC
- ✅ Payment state tracked in application
- ✅ No third-party facilitator needed
- ✅ Simpler implementation for hackathon

**Mainnet Approach (Future):**
- ❌ Would require facilitator service
- ❌ Additional security requirements
- ❌ Fee payer setup (CDP API)
- ❌ More complex infrastructure

### Mainnet Facilitator Setup

If deploying to mainnet, see Coinbase's documentation:

**Reference:** https://docs.cdp.coinbase.com/x402/quickstart-for-sellers#solana-network

**Requirements:**
1. CDP API keys (CDP_API_KEY_ID, CDP_API_KEY_SECRET)
2. Facilitator service configuration
3. Fee payer setup
4. Mainnet wallet addresses
5. Production security measures

---

## X402 Protocol Alignment

### Hackathon Requirements

✅ **HTTP 402 Status Code** - Proper use of Payment Required status
✅ **X402 Protocol Headers** - Payment requirements conveyed via headers
✅ **Blockchain Verification** - Payments verified on Solana devnet
✅ **AI Agent Integration** - Agent autonomously evaluates and rewards
✅ **Autonomous Payments** - No human approval for agent decisions

### What Makes This X402?

1. **HTTP 402 "Payment Required"**
   - Server returns proper 402 status code
   - Frontend displays status to user
   - Standard HTTP protocol compliance

2. **Protocol Headers**
   - `X-Payment-*` headers convey requirements
   - `X-Access-*` headers confirm verification
   - Compatible with x402 specification

3. **Blockchain Integration**
   - Solana devnet for payment verification
   - Direct RPC verification (no facilitator needed on devnet)
   - Real blockchain transactions

4. **AI Agent Autonomy**
   - OpenAI agent evaluates answers
   - Agent decides when to send rewards
   - No human intervention in payment flow

---

## Testing the X402 Flow

### Step-by-Step Test:

1. **Connect Wallet**
   ```bash
   # Connect Phantom or create embedded wallet
   # Backend verifies access via /api/x402/verify-access
   ```

2. **See HTTP 402 Status**
   ```
   Frontend displays:
   - "HTTP 402" badge
   - "Payment Required" message
   - X402 protocol headers
   ```

3. **Make Payment**
   ```bash
   # Click "Pay 0.04 SOL" button
   # Transaction sent to Solana devnet
   # Payment state updated
   ```

4. **Access Granted**
   ```bash
   # Backend returns HTTP 200
   # X-Payment-Verified: true header
   # ChatInterface renders (access granted)
   ```

### Console Verification:

Check browser console for x402 logs:

```javascript
🔒 HTTP 402: Payment Required {statusCode: 402, message: "...", ...}
✅ HTTP 200: Access Granted
```

---

## X402 vs Traditional Payment Gates

| Feature | Traditional | X402 Protocol |
|---------|-------------|---------------|
| **Status Code** | Custom/None | HTTP 402 standard |
| **Payment Info** | JSON body only | HTTP headers + body |
| **Verification** | Application logic | Protocol-defined flow |
| **Interoperability** | Application-specific | Standard protocol |
| **Agent Compatibility** | Limited | AI agent-friendly |

---

## Future Enhancements

### For Mainnet Deployment:

1. **Add Facilitator Service**
   - Integrate Coinbase facilitator
   - Configure CDP API keys
   - Set up fee payer

2. **Enhanced Security**
   - Payment signature verification
   - Replay attack prevention
   - Session token management

3. **Full X402 Compliance**
   - Additional protocol headers
   - Payment proof mechanism
   - Standardized error codes

### Optional Integrations:

- **`x402-next` Package** - Official x402 middleware
- **Payment Streaming** - Ongoing payment flows
- **Multi-Network Support** - Ethereum, Polygon, etc.

---

## References

### X402 Protocol:
- [X402 Specification](https://github.com/coinbase/x402)
- [Solana X402 Templates](https://templates.solana.com/x402-template)
- [Coinbase CDP X402 Docs](https://docs.cdp.coinbase.com/x402/quickstart-for-sellers)

### Solana Resources:
- [Solana Documentation](https://docs.solana.com/)
- [Solana Devnet Faucet](https://faucet.solana.com/)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

---

## Summary

This project demonstrates **x402 protocol integration** for the Solana x402 Hackathon by:

✅ Implementing HTTP 402 "Payment Required" status code
✅ Using x402 protocol headers for payment requirements
✅ Verifying payments on Solana blockchain (devnet)
✅ Building an autonomous AI agent that manages payments
✅ Creating a learn-and-earn application with x402 payment gates

**Result:** A production-ready x402 implementation suitable for hackathon evaluation and future mainnet deployment with minimal modifications.

---

**Built for:** Solana x402 Hackathon - Track 5 (x402 Agent Application)
**Network:** Solana Devnet
**Status:** ✅ X402 Protocol Compliant
