from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class UserProgressBase(BaseModel):
    user_id: str
    course_id: str
    progress_percentage: float = 0.0
    last_accessed_module_id: Optional[str] = None
    last_accessed_lecture_id: Optional[str] = None
    completed_lectures: dict[str, datetime] = {}  # lectureId -> completion timestamp


class UserProgressCreate(UserProgressBase):
    pass


class UserProgress(UserProgressBase):
    id: str  # Format: {userId}_{courseId}
    enrollment_date: datetime = Field(default_factory=datetime.utcnow)


class ModuleProgress(BaseModel):
    module_id: str
    title: str
    order_index: int
    status: Literal["completed", "in-progress", "locked"]
    completed_count: int
    total_count: int
    lectures: list["LectureProgress"]


class LectureProgress(BaseModel):
    lecture_id: str
    title: str
    order_index: int
    duration: str
    is_completed: bool
    completed_at: Optional[datetime] = None


class CourseProgressResponse(BaseModel):
    user_id: str
    course_id: str
    progress_percentage: float
    enrollment_date: datetime
    modules: list[ModuleProgress]


class CompleteLectureRequest(BaseModel):
    user_id: str
    course_id: str
    lecture_id: str


class ProgressUpdateResponse(BaseModel):
    success: bool
    new_progress_percentage: float
    message: str
