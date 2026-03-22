from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class QuizOption(BaseModel):
    letter: str  # A, B, C, D
    text: str
    is_correct: bool = False


class QuizQuestion(BaseModel):
    id: str
    text: str
    points: int = 1
    options: list[QuizOption]
    immediate_feedback: Optional[str] = None


class ContextSource(BaseModel):
    type: Literal["module", "lecture"]
    id: str


class QuizBase(BaseModel):
    context_source: ContextSource
    title: str
    time_limit_seconds: int = 900  # 15 minutes default
    questions: list[QuizQuestion]


class QuizCreate(QuizBase):
    pass


class Quiz(QuizBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QuizResponse(BaseModel):
    id: str
    title: str
    time_limit_seconds: int
    question_count: int
    total_points: int
    questions: list[QuizQuestion]


class QuizAttemptBase(BaseModel):
    quiz_id: str
    user_id: str
    score: int
    accuracy_percentage: float
    time_taken_seconds: int
    answers: dict[str, str]  # questionId -> selected letter


class QuizAttemptCreate(QuizAttemptBase):
    pass


class QuizAttempt(QuizAttemptBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SubmitQuizRequest(BaseModel):
    user_id: str
    quiz_id: str
    answers: dict[str, str]
    time_taken_seconds: int


class QuizResultResponse(BaseModel):
    attempt_id: str
    score: int
    total_points: int
    accuracy_percentage: float
    correct_answers: dict[str, str]
    time_taken_seconds: int


# AI Quiz Generation
class GenerateQuizRequest(BaseModel):
    user_id: str
    lecture_id: str


class GenerateQuizResponse(BaseModel):
    quiz_id: str
    title: str
    question_count: int
