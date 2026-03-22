from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class CourseStats(BaseModel):
    rating: float = 0.0
    reviews_count: int = 0
    enrollment_count: int = 0


class ResourceItem(BaseModel):
    title: str
    type: str  # PDF, Video, etc.
    size: str
    file_url: str


class LectureBase(BaseModel):
    order_index: int
    title: str
    video_url: str
    description: Optional[str] = None
    duration: str  # e.g., "45 MIN"
    resources: list[ResourceItem] = []


class Lecture(LectureBase):
    id: str


class ModuleBase(BaseModel):
    order_index: int
    title: str
    description: Optional[str] = None
    total_duration: str  # e.g., "2 hrs"


class Module(ModuleBase):
    id: str
    lectures: list[Lecture] = []


class ModuleWithStatus(Module):
    status: Literal["completed", "in-progress", "locked"] = "locked"
    completed_lectures_count: int = 0


class CourseBase(BaseModel):
    title: str
    description: str
    creator_id: str
    thumbnail_url: Optional[str] = None
    category: str  # Engineering, Computer Science, Business, etc.
    level: Literal["Beginner", "Intermediate", "Advanced"] = "Intermediate"
    price: float = 0.0
    status: Literal["draft", "published"] = "draft"
    duration_string: str  # e.g., "8 Weeks"
    tags: list[str] = []
    what_you_will_learn: list[str] = []
    requirements: list[str] = []


class CourseCreate(CourseBase):
    pass


class Course(CourseBase):
    id: str
    stats: CourseStats = Field(default_factory=CourseStats)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CourseWithModules(Course):
    modules: list[Module] = []
    module_count: int = 0
    lecture_count: int = 0


class CourseListItem(BaseModel):
    id: str
    title: str
    description: str
    instructor: str  # Derived from creator
    institution: str
    thumbnail_url: Optional[str] = None
    category: str
    level: str
    price: str  # Formatted price string
    rating: float
    rating_count: str
    stars: list[float]  # For star rating display
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    image: str
    instructor_image: str


class EnrollRequest(BaseModel):
    user_id: str
