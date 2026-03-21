import * as fs from 'fs'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'

async function deployVault() {
  console.log('🚀 Deploying EducateChain Vault to LocalNet...\n')

  try {
    const fixture = algorandFixture()
    await fixture.newScope()
    const { testAccount } = fixture.context

    console.log('📋 Deployment Details:')
    console.log(`   Account: ${testAccount.addr}`)
    console.log(`   Network: LocalNet`)
    console.log(`   Algod: http://localhost:4001\n`)

    // For now, just log the test account since we need to compile the contract first
    console.log('✅ Connection verified!\n')
    console.log('📝 Next steps:')
    console.log('   1. Compile contract: npx puyac contracts/vault.algo.ts')
    console.log('   2. Deploy using: algokit project deploy localnet')
    console.log('   3. Note the App ID from deployment output')
    console.log('   4. Update .env with VAULT_APP_ID=<app_id>\n')

    console.log(`For now, using Test Account for donations:`)
    console.log(`   Address: ${testAccount.addr}`)
    console.log(`   This account has 100+ ALGO automatically`)

    return testAccount.addr
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

deployVault().then(() => process.exit(0))
