"""
EducateChain Vault Smart Contract — Algorand Python (PuyaPy)

A transparent, on-chain education fund that:
  1. Accepts stablecoin (USDC/USDT) donations via ASA transfers
  2. Pays course sellers after reviewer approval
  3. Allows treasury to withdraw monthly AI-billing costs (oracle-read)
  4. All funds live on-chain — no single wallet holds them
"""

from algopy import (
    ARC4Contract,
    Account,
    Asset,
    BoxMap,
    Global,
    Txn,
    UInt64,
    arc4,
    gtxn,
    itxn,
    log,
    subroutine,
)


class EducateChainVault(ARC4Contract):
    """Vault that manages education donations, course payouts, and AI billing."""

    def __init__(self) -> None:
        # ── Global state ──────────────────────────────────────────────
        self.total_donations = UInt64(0)
        self.treasury_wallet = Account()
        self.accepted_asset_id = UInt64(0)
        self.withdrawn_this_month = UInt64(0)
        self.admin = Account()
        self.bootstrapped = UInt64(0)

        # ── Box storage ───────────────────────────────────────────────
        # Reviewers: address → 1 (flag for existence)
        self.reviewers = BoxMap(Account, UInt64, key_prefix=b"r_")
        # Course escrows: course_id → packed data
        self.escrow_seller = BoxMap(UInt64, Account, key_prefix=b"es_")
        self.escrow_amount = BoxMap(UInt64, UInt64, key_prefix=b"ea_")
        self.escrow_approved = BoxMap(UInt64, UInt64, key_prefix=b"ep_")

    # ── Creation ──────────────────────────────────────────────────────

    @arc4.abimethod(create="require")
    def create(
        self,
        treasury_wallet: arc4.Address,
        accepted_asset_id: arc4.UInt64,
    ) -> None:
        """Initialise the vault with a treasury wallet and accepted stablecoin ASA."""
        self.treasury_wallet = treasury_wallet.native
        self.accepted_asset_id = accepted_asset_id.native
        self.admin = Txn.sender
        log(b"VaultCreated")

    @arc4.abimethod
    def bootstrap(self) -> None:
        """Bootstrap the vault — call after funding the app account.
        Sets the admin as the first reviewer (requires box MBR).
        """
        assert Txn.sender == self.admin, "Only admin"
        assert self.bootstrapped == UInt64(0), "Already bootstrapped"
        self.reviewers[Txn.sender] = UInt64(1)
        self.bootstrapped = UInt64(1)
        log(b"Bootstrapped")

    # ── ASA Opt-in ────────────────────────────────────────────────────

    @arc4.abimethod
    def opt_in_to_asset(self, asset: Asset) -> None:
        """Contract opts into the accepted stablecoin so it can receive donations."""
        assert Txn.sender == self.admin, "Only admin can opt in to assets"
        assert asset.id == self.accepted_asset_id, "Asset does not match accepted ASA"

        itxn.AssetTransfer(
            xfer_asset=asset,
            asset_receiver=Global.current_application_address,
            asset_amount=0,
            fee=0,
        ).submit()
        log(b"AssetOptedIn")

    # ── Donations ─────────────────────────────────────────────────────

    @arc4.abimethod
    def deposit_donation(
        self,
        payment: gtxn.AssetTransferTransaction,
    ) -> None:
        """Accept a stablecoin donation.

        The caller must send a grouped ASA transfer immediately before
        this app call.  We verify:
          • The ASA matches our accepted asset
          • The receiver is the contract address
          • The amount is > 0
        """
        assert payment.xfer_asset.id == self.accepted_asset_id, "Wrong ASA"
        assert (
            payment.asset_receiver == Global.current_application_address
        ), "Must send to contract"
        assert payment.asset_amount > 0, "Must donate > 0"

        self.total_donations += payment.asset_amount
        log(b"DonationReceived")

    # ── Course Escrow ─────────────────────────────────────────────────

    @arc4.abimethod
    def request_course_payout(
        self,
        course_id: arc4.UInt64,
        seller_wallet: arc4.Address,
        amount: arc4.UInt64,
    ) -> None:
        """Register a course for payout review."""
        cid = course_id.native
        amt = amount.native
        seller = seller_wallet.native

        assert amt > 0, "Amount must be > 0"
        assert amt <= self.total_donations, "Insufficient donated funds"
        assert cid not in self.escrow_seller, "Course already pending"

        self.escrow_seller[cid] = seller
        self.escrow_amount[cid] = amt
        self.escrow_approved[cid] = UInt64(0)  # 0 = pending
        log(b"CoursePayoutRequested")

    @arc4.abimethod
    def approve_course_payout(
        self,
        course_id: arc4.UInt64,
        asset: Asset,
    ) -> None:
        """Reviewer approves a course — contract auto-sends ASA to seller."""
        cid = course_id.native
        assert self._is_reviewer(Txn.sender), "Only reviewers"
        assert cid in self.escrow_seller, "Escrow not found"
        assert self.escrow_approved[cid] == UInt64(0), "Already processed"
        assert asset.id == self.accepted_asset_id, "Wrong ASA"

        seller = self.escrow_seller[cid]
        amt = self.escrow_amount[cid]

        # Send stablecoin to seller
        itxn.AssetTransfer(
            xfer_asset=asset,
            asset_receiver=seller,
            asset_amount=amt,
            fee=0,
        ).submit()

        self.escrow_approved[cid] = UInt64(1)  # 1 = approved & paid
        self.total_donations -= amt
        log(b"CourseApproved")

    @arc4.abimethod
    def reject_course_payout(self, course_id: arc4.UInt64) -> None:
        """Reviewer rejects a course — escrow is deleted."""
        cid = course_id.native
        assert self._is_reviewer(Txn.sender), "Only reviewers"
        assert cid in self.escrow_seller, "Escrow not found"

        del self.escrow_seller[cid]
        del self.escrow_amount[cid]
        del self.escrow_approved[cid]
        log(b"CourseRejected")

    # ── Monthly Oracle Withdrawal ─────────────────────────────────────

    @arc4.abimethod
    def withdraw_monthly_oracle_amount(
        self,
        amount_owed: arc4.UInt64,
        asset: Asset,
    ) -> None:
        """Treasury withdraws the AI-billing amount (read from oracle off-chain)."""
        amt = amount_owed.native
        assert Txn.sender == self.treasury_wallet, "Only treasury"
        assert amt <= self.total_donations, "Insufficient funds"
        assert asset.id == self.accepted_asset_id, "Wrong ASA"

        itxn.AssetTransfer(
            xfer_asset=asset,
            asset_receiver=self.treasury_wallet,
            asset_amount=amt,
            fee=0,
        ).submit()

        self.total_donations -= amt
        self.withdrawn_this_month += amt
        log(b"MonthlyWithdrawal")

    @arc4.abimethod
    def reset_monthly_counter(self) -> None:
        """Reset the monthly withdrawal tracker (called at month start)."""
        assert Txn.sender == self.treasury_wallet, "Only treasury"
        self.withdrawn_this_month = UInt64(0)
        log(b"MonthlyCounterReset")

    # ── Reviewer Management ───────────────────────────────────────────

    @arc4.abimethod
    def add_reviewer(self, reviewer: arc4.Address) -> None:
        """Add a new reviewer (admin only)."""
        assert Txn.sender == self.admin, "Only admin"
        self.reviewers[reviewer.native] = UInt64(1)
        log(b"ReviewerAdded")

    @arc4.abimethod
    def remove_reviewer(self, reviewer: arc4.Address) -> None:
        """Remove a reviewer (admin only)."""
        assert Txn.sender == self.admin, "Only admin"
        addr = reviewer.native
        assert addr in self.reviewers, "Not a reviewer"
        del self.reviewers[addr]
        log(b"ReviewerRemoved")

    # ── Read-only Queries ─────────────────────────────────────────────

    @arc4.abimethod(readonly=True)
    def get_total_donations(self) -> arc4.UInt64:
        """Return the total donations held in the vault."""
        return arc4.UInt64(self.total_donations)

    @arc4.abimethod(readonly=True)
    def get_withdrawn_this_month(self) -> arc4.UInt64:
        """Return amount withdrawn this month for AI billing."""
        return arc4.UInt64(self.withdrawn_this_month)

    @arc4.abimethod(readonly=True)
    def get_accepted_asset_id(self) -> arc4.UInt64:
        """Return the accepted stablecoin ASA ID."""
        return arc4.UInt64(self.accepted_asset_id)

    @arc4.abimethod(readonly=True)
    def get_course_escrow_amount(self, course_id: arc4.UInt64) -> arc4.UInt64:
        """Return the escrowed amount for a course (0 if none)."""
        cid = course_id.native
        if cid in self.escrow_amount:
            return arc4.UInt64(self.escrow_amount[cid])
        return arc4.UInt64(0)

    @arc4.abimethod(readonly=True)
    def get_course_escrow_approved(self, course_id: arc4.UInt64) -> arc4.UInt64:
        """Return whether a course escrow has been approved (1) or not (0)."""
        cid = course_id.native
        if cid in self.escrow_approved:
            return arc4.UInt64(self.escrow_approved[cid])
        return arc4.UInt64(0)

    @arc4.abimethod(readonly=True)
    def is_reviewer(self, address: arc4.Address) -> arc4.Bool:
        """Check if an address is a reviewer."""
        return arc4.Bool(self._is_reviewer(address.native))

    # ── Internal helpers ──────────────────────────────────────────────

    @subroutine
    def _is_reviewer(self, address: Account) -> bool:
        """Check reviewer status from BoxMap."""
        if address in self.reviewers:
            return True
        return False
