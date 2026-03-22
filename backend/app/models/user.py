from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class UserBase(BaseModel):
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: list[str] = []
    role: Literal["student", "creator"] = "student"


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: str
    joined_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: list[str] = []
    role: str
    joined_at: datetime
