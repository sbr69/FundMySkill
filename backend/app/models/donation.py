from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class DonationBase(BaseModel):
    donor_address: str
    recipient_address: str
    amount_usdc: float
    message: Optional[str] = None
    donor_user_id: Optional[str] = None


class DonationVerifyRequest(BaseModel):
    tx_hash: str
    sender: str
    amount: float
    token_type: Literal["ALGO", "USDC"] = "USDC"
    custom_message: Optional[str] = None
    user_id: Optional[str] = None


class Donation(DonationBase):
    id: str  # tx_hash
    verified_at: datetime = Field(default_factory=datetime.utcnow)
    status: Literal["pending", "confirmed", "failed"] = "pending"


class DonationResponse(BaseModel):
    tx_hash: str
    status: str
    message: str
    amount: float
    token_type: str


class LeaderboardEntry(BaseModel):
    rank: int
    donor_address: str
    total_amount: float
    donation_count: int
    last_donation_at: datetime


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    total_raised: float
