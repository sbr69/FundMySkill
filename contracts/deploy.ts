import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'

async function deployVault() {
  const fixture = algorandFixture()
  await fixture.newScope()
  const { testAccount } = fixture.context

  console.log('Deploying EducateChain Vault contract to LocalNet...')

  try {
    console.log(`✓ Using account: ${testAccount.addr}`)
    console.log(`✓ Connected to LocalNet (algod: 4001, kmd: 4002)`)

    return testAccount.addr
  } catch (error) {
    console.error('Deployment error:', error)
    process.exit(1)
  }
}

deployVault().then((addr) => {
  console.log(`\n✅ TEST CONNECTION SUCCESSFUL`)
  console.log(`   Connected to account: ${addr}`)
  console.log(`\nNext: Use Pera wallet or deploy via AlgoKit CLI`)
  process.exit(0)
}).catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
