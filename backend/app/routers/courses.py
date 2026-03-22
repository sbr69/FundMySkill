"""
Courses router - handles course discovery, details, and enrollment.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

from app.services.firebase import get_firestore, datetime_to_firestore
from app.models.course import (
    Course,
    CourseWithModules,
    CourseListItem,
    EnrollRequest,
    Module,
    Lecture,
)

router = APIRouter(prefix="/api/courses", tags=["courses"])


def rating_to_stars(rating: float) -> list[float]:
    """Convert a rating to star array for frontend display."""
    stars = []
    full_stars = int(rating)
    has_half = (rating - full_stars) >= 0.5

    for _ in range(full_stars):
        stars.append(1.0)
    if has_half:
        stars.append(0.5)
    while len(stars) < 5:
        stars.append(0.0)

    return stars


def format_price(price: float) -> str:
    """Format price for display."""
    if price == 0:
        return "Free"
    return f"${price:.2f}"


def format_rating_count(count: int) -> str:
    """Format rating count for display."""
    if count >= 1000:
        return f"{count/1000:.1f}k"
    return str(count)


@router.get("")
async def get_courses(
    category: Optional[str] = Query(None, description="Filter by category"),
    level: Optional[str] = Query(None, description="Filter by level"),
    price_max: Optional[float] = Query(None, description="Maximum price filter"),
    search: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
) -> dict:
    """
    Get paginated list of courses with optional filters.
    Returns courses formatted for the CourseCataloguePage.
    """
    db = get_firestore()

    # Get all courses
    docs = list(db.collection("courses").stream())

    # Filter courses
    courses = []
    for doc in docs:
        data = doc.to_dict()
        if not data:
            continue

        # Skip draft courses
        if data.get("status") != "published":
            continue

        # Category filter
        if category and data.get("category") != category:
            continue

        # Level filter
        if level and data.get("level") != level:
            continue

        # Price filter
        if price_max is not None and data.get("price", 0) > price_max:
            continue

        # Search filter
        if search:
            search_lower = search.lower()
            title = data.get("title", "").lower()
            desc = data.get("description", "").lower()
            tags = " ".join(data.get("tags", [])).lower()
            if search_lower not in title and search_lower not in desc and search_lower not in tags:
                continue

        # Get embedded instructor info (no more fetching creators!)
        instructor_name = data.get("instructor_name", "Unknown Instructor")
        instructor_bio = data.get("instructor_bio", "Independent")
        instructor_image = data.get("instructor_image", f"https://i.pravatar.cc/150?u={doc.id}")

        stats = data.get("stats", {})
        rating = stats.get("rating", 4.5)

        # Determine badge
        badge = None
        badge_color = ""
        enrollment_count = stats.get("enrollment_count", 0)

        if enrollment_count > 5000:
            badge = "Best Seller"
            badge_color = "text-primary"
        elif enrollment_count > 2000:
            badge = "Popular"
            badge_color = "text-secondary"
        elif data.get("level") == "Advanced":
            badge = "Advanced"
            badge_color = "text-tertiary"

        course_item = CourseListItem(
            id=doc.id,
            title=data.get("title", ""),
            description=data.get("description", ""),
            instructor=instructor_name,
            institution=instructor_bio,
            thumbnail_url=data.get("thumbnail_url"),
            category=data.get("category", ""),
            level=data.get("level", ""),
            price=format_price(data.get("price", 0)),
            rating=rating,
            rating_count=format_rating_count(stats.get("reviews_count", 0)),
            stars=rating_to_stars(rating),
            badge=badge,
            badge_color=badge_color,
            image=data.get("thumbnail_url", ""),
            instructor_image=instructor_image,
        )
        courses.append(course_item)

    # Pagination
    total = len(courses)
    start = (page - 1) * limit
    end = start + limit
    paginated_courses = courses[start:end]

    return {
        "courses": [c.model_dump() for c in paginated_courses],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/categories")
async def get_categories() -> dict:
    """Get all unique categories with counts."""
    db = get_firestore()
    docs = list(db.collection("courses").stream())

    categories = {}
    for doc in docs:
        data = doc.to_dict()
        if data and data.get("status") == "published":
            cat = data.get("category", "Other")
            categories[cat] = categories.get(cat, 0) + 1

    return {"categories": [{"name": k, "count": v} for k, v in sorted(categories.items())]}


@router.get("/{course_id}")
async def get_course(course_id: str) -> dict:
    """
    Get full course details including modules and lectures.
    Returns data for CourseOverviewPage.
    """
    db = get_firestore()

    # Get course document
    course_doc = db.collection("courses").document(course_id).get()
    if not course_doc.exists:
        raise HTTPException(status_code=404, detail="Course not found")

    course_data = course_doc.to_dict()

    # Get embedded instructor info
    instructor_name = course_data.get("instructor_name", "Unknown Instructor")
    instructor_bio = course_data.get("instructor_bio", "Independent")
    instructor_image = course_data.get("instructor_image", f"https://i.pravatar.cc/150?u={course_id}")

    # Get modules with lectures
    modules = []
    module_docs = list(
        db.collection("courses")
        .document(course_id)
        .collection("modules")
        .order_by("order_index")
        .stream()
    )

    total_lectures = 0

    for mod_doc in module_docs:
        mod_data = mod_doc.to_dict()

        # Get lectures for this module
        lecture_docs = list(
            db.collection("courses")
            .document(course_id)
            .collection("modules")
            .document(mod_doc.id)
            .collection("lectures")
            .order_by("order_index")
            .stream()
        )

        lectures = []
        for lec_doc in lecture_docs:
            lec_data = lec_doc.to_dict()
            lectures.append({
                "id": lec_doc.id,
                "title": lec_data.get("title", ""),
                "duration": lec_data.get("duration", "45 MIN"),
                "order_index": lec_data.get("order_index", 0),
                "video_url": lec_data.get("video_url", ""),
                "description": lec_data.get("description", ""),
            })

        total_lectures += len(lectures)

        modules.append({
            "id": mod_doc.id,
            "title": mod_data.get("title", ""),
            "description": mod_data.get("description", ""),
            "order_index": mod_data.get("order_index", 0),
            "total_duration": mod_data.get("total_duration", "2 hrs"),
            "lecture_count": len(lectures),
            "lectures": lectures,
        })

    stats = course_data.get("stats", {})

    return {
        "id": course_id,
        "title": course_data.get("title", ""),
        "description": course_data.get("description", ""),
        "instructor": instructor_name,
        "institution": instructor_bio,
        "instructor_image": instructor_image,
        "thumbnail_url": course_data.get("thumbnail_url", ""),
        "category": course_data.get("category", ""),
        "level": course_data.get("level", ""),
        "price": format_price(course_data.get("price", 0)),
        "duration_string": course_data.get("duration_string", "8 Weeks"),
        "rating": stats.get("rating", 4.5),
        "rating_count": format_rating_count(stats.get("reviews_count", 0)),
        "stars": rating_to_stars(stats.get("rating", 4.5)),
        "enrollment_count": stats.get("enrollment_count", 0),
        "what_you_will_learn": course_data.get("what_you_will_learn", []),
        "requirements": course_data.get("requirements", []),
        "tags": course_data.get("tags", []),
        "module_count": len(modules),
        "lecture_count": total_lectures,
        "modules": modules,
    }


@router.post("/{course_id}/enroll")
async def enroll_in_course(course_id: str, request: EnrollRequest) -> dict:
    """
    Enroll a user in a course.
    Creates a user_progress document.
    """
    db = get_firestore()

    # Check if course exists
    course_doc = db.collection("courses").document(course_id).get()
    if not course_doc.exists:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled
    progress_id = f"{request.user_id}_{course_id}"
    progress_doc = db.collection("user_progress").document(progress_id).get()
    if progress_doc.exists:
        return {
            "success": True,
            "message": "Already enrolled",
            "progress_id": progress_id,
        }

    # Get first module and lecture
    module_docs = list(
        db.collection("courses")
        .document(course_id)
        .collection("modules")
        .order_by("order_index")
        .limit(1)
        .stream()
    )

    first_module_id = None
    first_lecture_id = None

    if module_docs:
        first_module_id = module_docs[0].id
        lecture_docs = list(
            db.collection("courses")
            .document(course_id)
            .collection("modules")
            .document(first_module_id)
            .collection("lectures")
            .order_by("order_index")
            .limit(1)
            .stream()
        )
        if lecture_docs:
            first_lecture_id = lecture_docs[0].id

    # Create progress document
    from datetime import datetime, timezone
    progress_data = {
        "user_id": request.user_id,
        "course_id": course_id,
        "enrollment_date": datetime_to_firestore(datetime.now(timezone.utc)),
        "progress_percentage": 0.0,
        "last_accessed_module_id": first_module_id,
        "last_accessed_lecture_id": first_lecture_id,
        "completed_lectures": {},
    }

    db.collection("user_progress").document(progress_id).set(progress_data)

    # Increment enrollment count
    course_data = course_doc.to_dict()
    stats = course_data.get("stats", {})
    stats["enrollment_count"] = stats.get("enrollment_count", 0) + 1
    db.collection("courses").document(course_id).update({"stats": stats})

    return {
        "success": True,
        "message": "Successfully enrolled",
        "progress_id": progress_id,
    }
