// Quick script to generate a treasury wallet for the AI agent
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import fs from 'fs'

console.log('🔐 Generating Treasury Wallet...\n')

// Generate new keypair
const keypair = Keypair.generate()

// Get the secret key in different formats
const secretKeyArray = Array.from(keypair.secretKey)
const secretKeyBase58 = bs58.encode(keypair.secretKey)

console.log('✅ Treasury Wallet Generated!\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📍 PUBLIC KEY (share this to receive funds):')
console.log(keypair.publicKey.toBase58())
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('🔑 PRIVATE KEY - Base58 Format (RECOMMENDED):')
console.log('Copy this to your .env file as TREASURY_WALLET_KEYPAIR')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(secretKeyBase58)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('🔑 PRIVATE KEY - JSON Array Format (LEGACY):')
console.log('Alternative format if base58 doesn\'t work')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(JSON.stringify(secretKeyArray))
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Save to file
const walletData = {
  publicKey: keypair.publicKey.toBase58(),
  secretKeyBase58: secretKeyBase58,
  secretKeyArray: secretKeyArray,
  created: new Date().toISOString()
}

fs.writeFileSync('treasury-wallet.json', JSON.stringify(walletData, null, 2))
console.log('💾 Wallet details saved to: treasury-wallet.json\n')

console.log('📋 NEXT STEPS:')
console.log('1. Copy the Base58 private key above')
console.log('2. Add to your .env file (or Railway/Vercel env vars):')
console.log('   TREASURY_WALLET_KEYPAIR=<paste_base58_key_here>')
console.log('3. Fund this wallet with devnet SOL:')
console.log(`   Visit: https://faucet.solana.com/`)
console.log(`   Or use: solana airdrop 5 ${keypair.publicKey.toBase58()} --url devnet`)
console.log('4. Restart your backend server')
console.log('5. Test the reward functionality!\n')

console.log('⚠️  SECURITY WARNING:')
console.log('Never commit treasury-wallet.json to git!')
console.log('Keep your private keys secret!\n')
