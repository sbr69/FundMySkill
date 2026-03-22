from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class ChatMessage(BaseModel):
    role: Literal["user", "ai"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AISessionBase(BaseModel):
    user_id: str
    lecture_id: str
    messages: list[ChatMessage] = []


class AISession(AISessionBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TutorChatRequest(BaseModel):
    user_id: str
    lecture_id: str
    message: str


class TutorChatResponse(BaseModel):
    response: str
    suggested_prompts: list[str]
    session_id: str
