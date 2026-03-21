import { describe, it, expect, beforeAll } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Uint64 } from '@algorandfoundation/algorand-typescript'
import { EducateChainVault } from './vault.algo'

describe('EducateChain Vault Contract', () => {
  let fixture: ReturnType<typeof algorandFixture>
  let appClient: InstanceType<typeof EducateChainVault.appClient>
  let creator: any
  let donor: any
  let seller: any
  let reviewer: any

  beforeAll(async () => {
    fixture = algorandFixture()
    const { testAccount: ta1, generateAccount: ta2 } = fixture.context

    creator = ta1
    donor = await ta2()
    seller = await ta2()
    reviewer = await ta2()

    // Fund test accounts
    await fixture.context.fundAccount(donor.addr, 10_000_000)
    await fixture.context.fundAccount(seller.addr, 10_000_000)
    await fixture.context.fundAccount(reviewer.addr, 10_000_000)

    appClient = new (EducateChainVault).appClient({
      sender: creator,
      transactionSigner: fixture.transactionSigner,
    })

    await appClient.create.onCreate()
  })

  it('should initialize vault with creator as default reviewer', async () => {
    const state = await appClient.getGlobalState()
    expect(state.totalDonationsReceived.value).toBe(BigInt(0))
  })

  it('should accept donations', async () => {
    const donationAmount = BigInt(1_000_000)

    await appClient.send.depositDonation({
      sender: donor,
      amount: donationAmount,
    })

    const state = await appClient.getGlobalState()
    expect(state.totalDonationsReceived.value).toBe(donationAmount)
  })

  it('should create course escrow', async () => {
    const courseId = BigInt(1)
    const payoutAmount = BigInt(500_000)

    await appClient.send.requestCoursePayout({
      sender: creator,
      args: [courseId, seller.addr, payoutAmount],
    })

    const escrow = await appClient.send.getCourseEscrowStatus({
      sender: creator,
      args: [courseId],
    })

    expect(escrow).toBeDefined()
  })

  it('should allow reviewer to approve course payout', async () => {
    const courseId = BigInt(2)
    const payoutAmount = BigInt(300_000)

    // Create escrow first
    await appClient.send.requestCoursePayout({
      sender: creator,
      args: [courseId, seller.addr, payoutAmount],
    })

    // Get seller balance before
    const balanceBefore = await fixture.context.algod.accountInformation(seller.addr)

    // Approve payout
    await appClient.send.approveCoursePayout({
      sender: creator,
      args: [courseId],
    })

    // Get seller balance after
    const balanceAfter = await fixture.context.algod.accountInformation(seller.addr)

    expect(balanceAfter.amount).toBeGreaterThan(balanceBefore.amount)
  })

  it('should calculate available balance correctly', async () => {
    const state = await appClient.getGlobalState()
    const availableBalance = await appClient.send.getAvailableBalance({
      sender: creator,
    })

    expect(availableBalance).toBeDefined()
  })

  it('only reviewers can approve payouts', async () => {
    const courseId = BigInt(3)
    const payoutAmount = BigInt(200_000)

    await appClient.send.requestCoursePayout({
      sender: creator,
      args: [courseId, seller.addr, payoutAmount],
    })

    // Non-reviewer should fail
    await expect(
      appClient.send.approveCoursePayout({
        sender: donor,
        args: [courseId],
      })
    ).rejects.toThrow('Only reviewers can approve payouts')
  })

  it('should handle monthly oracle withdrawal', async () => {
    const withdrawAmount = BigInt(100_000)

    const stateBefore = await appClient.getGlobalState()

    await appClient.send.withdrawMonthlyOracleAmount({
      sender: creator,
      args: [withdrawAmount],
    })

    const stateAfter = await appClient.getGlobalState()
    expect(stateAfter.withdrawnThisMonth.value).toBe(withdrawAmount)
  })

  it('should reset monthly counter', async () => {
    await appClient.send.resetMonthlyCounter({
      sender: creator,
    })

    const state = await appClient.getGlobalState()
    expect(state.withdrawnThisMonth.value).toBe(BigInt(0))
  })
})
