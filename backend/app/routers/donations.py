"""
Donations router - handles donation verification and leaderboard.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import httpx

from app.config import get_settings
from app.services.firebase import get_firestore, datetime_to_firestore, firestore_to_datetime
from app.models.donation import (
    DonationVerifyRequest,
    DonationResponse,
    LeaderboardEntry,
    LeaderboardResponse,
)

router = APIRouter(prefix="/api/donations", tags=["donations"])

# Algorand testnet USDC ASA ID
USDC_ASA_ID = 10458941


async def verify_algorand_transaction(tx_hash: str, expected_sender: str, expected_amount: float, token_type: str) -> dict:
    """
    Verify a transaction on Algorand testnet.
    Returns transaction details if valid.
    """
    settings = get_settings()

    try:
        async with httpx.AsyncClient() as client:
            # Query the indexer for transaction details
            response = await client.get(
                f"{settings.algorand_indexer_url}/v2/transactions/{tx_hash}",
                timeout=10.0,
            )

            if response.status_code != 200:
                return {"valid": False, "error": "Transaction not found"}

            tx_data = response.json().get("transaction", {})

            # Verify sender
            sender = tx_data.get("sender", "")
            if sender.upper() != expected_sender.upper():
                return {"valid": False, "error": "Sender mismatch"}

            # Check transaction type and amount
            if token_type == "ALGO":
                # Payment transaction
                if tx_data.get("tx-type") != "pay":
                    return {"valid": False, "error": "Not a payment transaction"}

                payment_info = tx_data.get("payment-transaction", {})
                amount_microalgos = payment_info.get("amount", 0)
                amount = amount_microalgos / 1_000_000  # Convert from microAlgos

                if amount < expected_amount * 0.99:  # 1% tolerance for fees
                    return {"valid": False, "error": "Amount mismatch"}

                receiver = payment_info.get("receiver", "")

            else:  # USDC
                # Asset transfer transaction
                if tx_data.get("tx-type") != "axfer":
                    return {"valid": False, "error": "Not an asset transfer transaction"}

                asset_transfer = tx_data.get("asset-transfer-transaction", {})
                asset_id = asset_transfer.get("asset-id", 0)

                if asset_id != USDC_ASA_ID:
                    return {"valid": False, "error": "Wrong asset"}

                amount_micro = asset_transfer.get("amount", 0)
                amount = amount_micro / 1_000_000  # USDC has 6 decimals

                if amount < expected_amount * 0.99:
                    return {"valid": False, "error": "Amount mismatch"}

                receiver = asset_transfer.get("receiver", "")

            return {
                "valid": True,
                "sender": sender,
                "receiver": receiver,
                "amount": amount,
                "confirmed_round": tx_data.get("confirmed-round"),
            }

    except httpx.RequestError as e:
        return {"valid": False, "error": f"Network error: {str(e)}"}
    except Exception as e:
        return {"valid": False, "error": f"Verification failed: {str(e)}"}


@router.post("/verify")
async def verify_donation(request: DonationVerifyRequest) -> DonationResponse:
    """
    Verify a donation transaction on Algorand and record it.
    """
    db = get_firestore()

    # Check if already verified
    existing_doc = db.collection("donations").document(request.tx_hash).get()
    if existing_doc.exists:
        existing_data = existing_doc.to_dict()
        return DonationResponse(
            tx_hash=request.tx_hash,
            status=existing_data.get("status", "confirmed"),
            message="Donation already recorded",
            amount=existing_data.get("amount_usdc", request.amount),
            token_type=request.token_type,
        )

    # Verify on blockchain
    verification = await verify_algorand_transaction(
        tx_hash=request.tx_hash,
        expected_sender=request.sender,
        expected_amount=request.amount,
        token_type=request.token_type,
    )

    if not verification.get("valid"):
        # Record as failed
        donation_data = {
            "donor_address": request.sender,
            "recipient_address": verification.get("receiver", ""),
            "amount_usdc": request.amount,
            "token_type": request.token_type,
            "message": request.custom_message,
            "donor_user_id": request.user_id,
            "verified_at": datetime_to_firestore(datetime.utcnow()),
            "status": "failed",
            "error": verification.get("error"),
        }
        db.collection("donations").document(request.tx_hash).set(donation_data)

        return DonationResponse(
            tx_hash=request.tx_hash,
            status="failed",
            message=verification.get("error", "Verification failed"),
            amount=request.amount,
            token_type=request.token_type,
        )

    # Record successful donation
    donation_data = {
        "donor_address": verification.get("sender"),
        "recipient_address": verification.get("receiver"),
        "amount_usdc": verification.get("amount"),
        "token_type": request.token_type,
        "message": request.custom_message,
        "donor_user_id": request.user_id,
        "verified_at": datetime_to_firestore(datetime.utcnow()),
        "status": "confirmed",
        "confirmed_round": verification.get("confirmed_round"),
    }

    db.collection("donations").document(request.tx_hash).set(donation_data)

    return DonationResponse(
        tx_hash=request.tx_hash,
        status="confirmed",
        message="Donation verified and recorded",
        amount=verification.get("amount"),
        token_type=request.token_type,
    )


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10) -> LeaderboardResponse:
    """
    Get top donors leaderboard.
    """
    db = get_firestore()

    # Get all confirmed donations
    donation_docs = list(
        db.collection("donations")
        .where("status", "==", "confirmed")
        .stream()
    )

    # Aggregate by donor
    donor_totals: dict[str, dict] = {}

    for doc in donation_docs:
        data = doc.to_dict()
        donor = data.get("donor_address", "")
        amount = data.get("amount_usdc", 0)
        verified_at = data.get("verified_at")

        if donor not in donor_totals:
            donor_totals[donor] = {
                "total_amount": 0,
                "donation_count": 0,
                "last_donation_at": None,
            }

        donor_totals[donor]["total_amount"] += amount
        donor_totals[donor]["donation_count"] += 1

        if verified_at:
            if isinstance(verified_at, str):
                verified_at = datetime.fromisoformat(verified_at)
            elif hasattr(verified_at, "timestamp"):
                verified_at = datetime.fromtimestamp(verified_at.timestamp())

            if (
                donor_totals[donor]["last_donation_at"] is None
                or verified_at > donor_totals[donor]["last_donation_at"]
            ):
                donor_totals[donor]["last_donation_at"] = verified_at

    # Sort by total amount
    sorted_donors = sorted(
        donor_totals.items(),
        key=lambda x: x[1]["total_amount"],
        reverse=True,
    )[:limit]

    # Build leaderboard entries
    entries = []
    total_raised = 0

    for rank, (donor, stats) in enumerate(sorted_donors, 1):
        entries.append(LeaderboardEntry(
            rank=rank,
            donor_address=donor,
            total_amount=round(stats["total_amount"], 2),
            donation_count=stats["donation_count"],
            last_donation_at=stats["last_donation_at"] or datetime.utcnow(),
        ))
        total_raised += stats["total_amount"]

    # Add remaining donors to total
    for donor, stats in donor_totals.items():
        if donor not in [e.donor_address for e in entries]:
            total_raised += stats["total_amount"]

    return LeaderboardResponse(
        entries=entries,
        total_raised=round(total_raised, 2),
    )


@router.get("/user/{user_id}")
async def get_user_donations(user_id: str) -> dict:
    """
    Get all donations made by a user.
    """
    db = get_firestore()

    donation_docs = list(
        db.collection("donations")
        .where("donor_user_id", "==", user_id)
        .where("status", "==", "confirmed")
        .stream()
    )

    donations = []
    total_donated = 0

    for doc in donation_docs:
        data = doc.to_dict()
        amount = data.get("amount_usdc", 0)
        total_donated += amount

        verified_at = data.get("verified_at")
        if isinstance(verified_at, str):
            verified_at = datetime.fromisoformat(verified_at)

        donations.append({
            "tx_hash": doc.id,
            "amount": amount,
            "token_type": data.get("token_type", "USDC"),
            "message": data.get("message"),
            "verified_at": verified_at.isoformat() if verified_at else None,
        })

    return {
        "user_id": user_id,
        "donations": donations,
        "total_donated": round(total_donated, 2),
        "donation_count": len(donations),
    }
