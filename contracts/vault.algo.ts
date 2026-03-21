import {
  Contract,
  Uint64,
  Account,
  Global,
  Txn,
  itxn,
  log,
} from '@algorandfoundation/algorand-typescript'
import { clone } from '@algorandfoundation/algorand-typescript'

interface CourseEscrow {
  courseId: uint64
  sellerWallet: Account
  amount: uint64
  approved: boolean
}

export class EducateChainVault extends Contract {
  totalDonationsReceived = GlobalState<uint64>()
  treasuryWallet = GlobalState<Account>()
  withdrawnThisMonth = GlobalState<uint64>()
  reviewers = GlobalState<bytes>()
  courseEscrows = new Map<uint64, CourseEscrow>()

  clearState(): boolean {
    return true
  }

  onCreate(): void {
    this.totalDonationsReceived.value = Uint64(0)
    this.treasuryWallet.value = Txn.sender
    this.withdrawnThisMonth.value = Uint64(0)
    this.reviewers.value = Txn.sender.bytes
    log('VaultInitialized')
  }

  depositDonation(): void {
    const donation = Txn.amount
    const currentTotal = clone(this.totalDonationsReceived.value)
    this.totalDonationsReceived.value = currentTotal + donation
    log('DonationReceived')
  }

  requestCoursePayout(courseId: uint64, sellerWallet: Account, amount: uint64): void {
    const balance = clone(this.totalDonationsReceived.value)
    if (amount > balance) return
    const escrow: CourseEscrow = { courseId, sellerWallet, amount, approved: false }
    this.courseEscrows.set(courseId, clone(escrow))
    log('CoursePayoutRequested')
  }

  approveCoursePayout(courseId: uint64): void {
    if (!this.isReviewer(Txn.sender)) return
    const escrow = this.courseEscrows.get(courseId)
    if (escrow === undefined) return
    const escrowClone = clone(escrow)
    itxn.payment({ receiver: escrowClone.sellerWallet, amount: escrowClone.amount }).suggest()
    escrowClone.approved = true
    this.courseEscrows.set(courseId, escrowClone)
    log('CourseApproved')
  }

  rejectCoursePayout(courseId: uint64): void {
    if (!this.isReviewer(Txn.sender)) return
    const escrow = this.courseEscrows.get(courseId)
    if (escrow === undefined) return
    this.courseEscrows.delete(courseId)
    log('CourseRejected')
  }

  withdrawMonthlyOracleAmount(amountOwed: uint64): void {
    const treasury = clone(this.treasuryWallet.value)
    if (Txn.sender !== treasury) return
    const balance = clone(this.totalDonationsReceived.value)
    if (amountOwed > balance) return
    itxn.payment({ receiver: treasury, amount: amountOwed }).suggest()
    this.totalDonationsReceived.value = balance - amountOwed
    const currentWithdrawn = clone(this.withdrawnThisMonth.value)
    this.withdrawnThisMonth.value = currentWithdrawn + amountOwed
    log('MonthlyWithdrawal')
  }

  resetMonthlyCounter(): void {
    const treasury = clone(this.treasuryWallet.value)
    if (Txn.sender !== treasury) return
    this.withdrawnThisMonth.value = Uint64(0)
    log('MonthlyCounterReset')
  }

  addReviewer(reviewerAddress: Account): void {
    if (Txn.sender !== Global.creatorAddress) return
    let currentReviewers = clone(this.reviewers.value)
    currentReviewers = currentReviewers + reviewerAddress.bytes
    this.reviewers.value = currentReviewers
    log('ReviewerAdded')
  }

  getAvailableBalance(): uint64 {
    let totalEscrow = Uint64(0)
    for (const courseId of this.courseEscrows.keys()) {
      const escrow = this.courseEscrows.get(courseId)
      if (escrow !== undefined && !clone(escrow).approved) {
        totalEscrow = totalEscrow + clone(escrow).amount
      }
    }
    const balance = clone(this.totalDonationsReceived.value)
    return balance >= totalEscrow ? balance - totalEscrow : Uint64(0)
  }

  getCurrentBalance(): uint64 {
    return clone(this.totalDonationsReceived.value)
  }

  getCourseEscrowStatus(courseId: uint64): CourseEscrow | undefined {
    return this.courseEscrows.get(courseId)
  }

  isReviewer(address: Account): boolean {
    const reviewersBytes = clone(this.reviewers.value)
    const addressBytes = address.bytes
    return reviewersBytes.includes(addressBytes)
  }
}
