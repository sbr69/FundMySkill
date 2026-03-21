# EducateChain Vault Smart Contract

The vault contract is the core of the EducateChain platform. It manages:
- Donations from contributors (received in ALGO)
- Course payment escrows (sellers request payouts, reviewers approve)
- Monthly oracle withdrawals (platform AI costs)
- Reviewer role management

## Contract Methods

### Public Methods (ABI)

#### `depositDonation()`
- **Description:** Accept ALGO donation into the vault
- **Sender:** Any account
- **Amount:** ALGO to donate
- **Emits:** `DonationReceived(donor, amount)`

#### `requestCoursePayout(courseId: uint64, sellerWallet: Account, amount: uint64)`
- **Description:** Seller requests payment for a course (creates escrow)
- **Sender:** Any account
- **Args:**
  - `courseId`: Unique course ID
  - `sellerWallet`: Seller's wallet to receive payment
  - `amount`: ALGO to pay out
- **Requirements:** Vault must have sufficient funds
- **Emits:** `CoursePayoutRequested(courseId, seller, amount)`

#### `approveCoursePayout(courseId: uint64)`
- **Description:** Reviewer approves course payment (sends ALGO to seller)
- **Sender:** Reviewer account
- **Args:**
  - `courseId`: Course ID to approve
- **Requirements:** Sender must be reviewer role
- **Emits:** `CourseApproved(courseId, seller, amount)`

#### `rejectCoursePayout(courseId: uint64)`
- **Description:** Reviewer rejects course (returns funds to vault)
- **Sender:** Reviewer account
- **Emits:** `CourseRejected(courseId)`

#### `withdrawMonthlyOracleAmount(amountOwed: uint64)`
- **Description:** Withdraw monthly API costs (called by oracle/treasury)
- **Sender:** Treasury wallet
- **Args:**
  - `amountOwed`: Amount to withdraw (from oracle)
- **Requirements:** Sender must be treasury wallet
- **Emits:** `MonthlyWithdrawal(amount)`

#### `resetMonthlyCounter()`
- **Description:** Reset monthly withdrawal counter (called at month start)
- **Sender:** Treasury wallet
- **Emits:** `MonthlyCounterReset`

#### `addReviewer(reviewerAddress: Account)`
- **Description:** Add a new reviewer to approve courses
- **Sender:** Contract creator only
- **Args:**
  - `reviewerAddress`: Address to add as reviewer
- **Emits:** `ReviewerAdded(reviewer)`

### Read-Only Methods

#### `getAvailableBalance(): uint64`
- **Description:** Get available balance (total - pending escrows)
- **Returns:** Available ALGO in vault

#### `getCurrentBalance(): uint64`
- **Description:** Get current total donations
- **Returns:** Total ALGO received

#### `getCourseEscrowStatus(courseId: uint64): CourseEscrow`
- **Description:** Get escrow details for a course
- **Args:**
  - `courseId`: Course ID
- **Returns:** Escrow object or undefined

#### `isReviewer(address: Account): boolean`
- **Description:** Check if address has reviewer role
- **Args:**
  - `address`: Address to check
- **Returns:** True if reviewer, false otherwise

## Building & Testing

### Build
```bash
cd contracts
npm install
npm run build
```

### Test
```bash
# Requires AlgoKit LocalNet running
npm run test
```

### Deploy to LocalNet
```bash
npm run deploy
```

## State Management

### Global State

| Key | Type | Purpose |
|-----|------|---------|
| `totalDonationsReceived` | uint64 | Total ALGO donated |
| `treasuryWallet` | Account | Platform wallet for API costs |
| `withdrawnThisMonth` | uint64 | Amount withdrawn this month |
| `reviewers` | bytes | Concatenated reviewer addresses |

### Box/Map State

| Key | Type | Purpose |
|-----|------|---------|
| `courseEscrows` | Map<uint64, CourseEscrow> | Pending course payouts |

### CourseEscrow Structure

```typescript
interface CourseEscrow {
  courseId: uint64
  sellerWallet: Account
  amount: uint64
  approved: boolean
}
```

## Security Considerations

- ✅ Only reviewers can approve/reject courses
- ✅ Only treasurer wallet can withdraw oracle amounts
- ✅ Contract validates sufficient funds before creating escrows
- ✅ No double-approval protection
- ✅ All state changes emit events for audit trail

## Architecture Notes

- **Single contract pattern:** All logic in one vault contract
- **Box storage:** Uses Algorand Box storage for course escrows (scalable)
- **Value semantics:** Always clone complex types (Algorand TypeScript requirement)
- **No off-chain DB:** Course data stored in contract state
- **Events via logs:** ARC-28 events emitted to logs for indexer pickup

## Future Enhancements

- Add course metadata (title, description) to escrow
- Implement tiered reviewer roles
- Add time-lock for disputed payouts
- Support multi-token payments (xUSDC, xUSDT)
- Batch operations for efficiency
