"""
Progress router - handles course progress tracking and lecture completion.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Literal
from datetime import datetime

from app.services.firebase import get_firestore, datetime_to_firestore, firestore_to_datetime
from app.models.progress import (
    CompleteLectureRequest,
    ProgressUpdateResponse,
    ModuleProgress,
    LectureProgress,
    CourseProgressResponse,
)

router = APIRouter(prefix="/api/progress", tags=["progress"])


def calculate_module_status(
    module_order: int,
    completed_count: int,
    total_count: int,
    current_module_order: int,
) -> Literal["completed", "in-progress", "locked"]:
    """
    Calculate the status of a module based on completion.
    - completed: all lectures done
    - in-progress: this is the current module (first incomplete after completed ones)
    - locked: no lectures can be accessed yet
    """
    if completed_count >= total_count:
        return "completed"
    elif module_order == current_module_order:
        return "in-progress"
    elif module_order < current_module_order:
        # Earlier module not fully complete - should be in-progress
        return "in-progress"
    else:
        return "locked"


@router.get("/{course_id}")
async def get_course_progress(
    course_id: str,
    user_id: str = Query(..., description="User ID"),
) -> dict:
    """
    Get user's progress for a course with module statuses.
    Returns the entire module structure with computed status flags.
    """
    db = get_firestore()

    # Get progress document
    progress_id = f"{user_id}_{course_id}"
    progress_doc = db.collection("user_progress").document(progress_id).get()

    if not progress_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User not enrolled in this course"
        )

    progress_data = progress_doc.to_dict()
    completed_lectures = progress_data.get("completed_lectures", {})

    # Get course modules
    module_docs = list(
        db.collection("courses")
        .document(course_id)
        .collection("modules")
        .order_by("order_index")
        .stream()
    )

    modules = []
    total_lectures = 0
    total_completed = 0
    current_module_order = None

    # First pass: collect all lecture info
    module_lecture_counts = []

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
        module_completed = 0

        for lec_doc in lecture_docs:
            lec_data = lec_doc.to_dict()
            is_completed = lec_doc.id in completed_lectures
            completed_at = None

            if is_completed:
                module_completed += 1
                total_completed += 1
                completed_timestamp = completed_lectures.get(lec_doc.id)
                if completed_timestamp:
                    completed_at = firestore_to_datetime(completed_timestamp)

            lectures.append({
                "id": lec_doc.id,
                "title": lec_data.get("title", ""),
                "order_index": lec_data.get("order_index", 0),
                "duration": lec_data.get("duration", "45 MIN"),
                "is_completed": is_completed,
                "completed_at": completed_at,
            })

        total_lectures += len(lectures)

        module_lecture_counts.append({
            "id": mod_doc.id,
            "title": mod_data.get("title", ""),
            "description": mod_data.get("description", ""),
            "order_index": mod_data.get("order_index", 0),
            "total_duration": mod_data.get("total_duration", "2 hrs"),
            "lectures": lectures,
            "completed_count": module_completed,
            "total_count": len(lectures),
        })

    # Second pass: determine current module and statuses
    # Find the first module that is not fully completed
    for mod_info in module_lecture_counts:
        if mod_info["completed_count"] < mod_info["total_count"]:
            current_module_order = mod_info["order_index"]
            break

    # If all modules are complete, set current to last
    if current_module_order is None and module_lecture_counts:
        current_module_order = module_lecture_counts[-1]["order_index"]

    # Build final module list with statuses
    for mod_info in module_lecture_counts:
        status = calculate_module_status(
            mod_info["order_index"],
            mod_info["completed_count"],
            mod_info["total_count"],
            current_module_order or 0,
        )

        lecture_progress = [
            LectureProgress(
                lecture_id=lec["id"],
                title=lec["title"],
                order_index=lec["order_index"],
                duration=lec["duration"],
                is_completed=lec["is_completed"],
                completed_at=lec["completed_at"],
            )
            for lec in mod_info["lectures"]
        ]

        modules.append(ModuleProgress(
            module_id=mod_info["id"],
            title=mod_info["title"],
            order_index=mod_info["order_index"],
            status=status,
            completed_count=mod_info["completed_count"],
            total_count=mod_info["total_count"],
            lectures=lecture_progress,
        ))

    # Calculate overall progress percentage
    progress_percentage = 0.0
    if total_lectures > 0:
        progress_percentage = (total_completed / total_lectures) * 100

    enrollment_date = progress_data.get("enrollment_date")
    if enrollment_date:
        enrollment_date = firestore_to_datetime(enrollment_date)
    else:
        enrollment_date = datetime.utcnow()

    return {
        "user_id": user_id,
        "course_id": course_id,
        "progress_percentage": round(progress_percentage, 1),
        "enrollment_date": enrollment_date.isoformat(),
        "total_lectures": total_lectures,
        "completed_lectures": total_completed,
        "modules": [m.model_dump() for m in modules],
    }


@router.post("/lecture/complete")
async def complete_lecture(request: CompleteLectureRequest) -> ProgressUpdateResponse:
    """
    Mark a lecture as completed.
    Updates the progress percentage and module statuses.
    """
    db = get_firestore()

    # Get progress document
    progress_id = f"{request.user_id}_{request.course_id}"
    progress_doc = db.collection("user_progress").document(progress_id).get()

    if not progress_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User not enrolled in this course"
        )

    progress_data = progress_doc.to_dict()
    completed_lectures = progress_data.get("completed_lectures", {})

    # Check if already completed
    if request.lecture_id in completed_lectures:
        return ProgressUpdateResponse(
            success=True,
            new_progress_percentage=progress_data.get("progress_percentage", 0),
            message="Lecture already completed"
        )

    # Mark as completed
    completed_lectures[request.lecture_id] = datetime_to_firestore(datetime.utcnow())

    # Count total lectures to calculate new percentage
    module_docs = list(
        db.collection("courses")
        .document(request.course_id)
        .collection("modules")
        .stream()
    )

    total_lectures = 0
    for mod_doc in module_docs:
        lecture_docs = list(
            db.collection("courses")
            .document(request.course_id)
            .collection("modules")
            .document(mod_doc.id)
            .collection("lectures")
            .stream()
        )
        total_lectures += len(lecture_docs)

    # Calculate new progress
    new_progress = 0.0
    if total_lectures > 0:
        new_progress = (len(completed_lectures) / total_lectures) * 100

    # Update progress document
    db.collection("user_progress").document(progress_id).update({
        "completed_lectures": completed_lectures,
        "progress_percentage": round(new_progress, 1),
        "last_accessed_lecture_id": request.lecture_id,
    })

    return ProgressUpdateResponse(
        success=True,
        new_progress_percentage=round(new_progress, 1),
        message="Lecture marked as completed"
    )


@router.get("/enrolled/{user_id}")
async def get_enrolled_courses(user_id: str) -> dict:
    """
    Get all courses a user is enrolled in with their progress.
    """
    db = get_firestore()

    # Find all progress documents for this user
    progress_docs = list(
        db.collection("user_progress")
        .where("user_id", "==", user_id)
        .stream()
    )

    enrolled_courses = []

    for prog_doc in progress_docs:
        prog_data = prog_doc.to_dict()
        course_id = prog_data.get("course_id")

        if not course_id:
            continue

        # Get course details
        course_doc = db.collection("courses").document(course_id).get()
        if not course_doc.exists:
            continue

        course_data = course_doc.to_dict()

        # Get creator info
        creator_id = course_data.get("creator_id", "")
        instructor_name = "Unknown Instructor"

        if creator_id:
            creator_doc = db.collection("users").document(creator_id).get()
            if creator_doc.exists:
                creator_data = creator_doc.to_dict()
                instructor_name = creator_data.get("name", instructor_name)

        enrollment_date = prog_data.get("enrollment_date")
        if enrollment_date:
            enrollment_date = firestore_to_datetime(enrollment_date)
        else:
            enrollment_date = datetime.utcnow()

        enrolled_courses.append({
            "id": course_id,
            "title": course_data.get("title", ""),
            "description": course_data.get("description", ""),
            "instructor": instructor_name,
            "thumbnail_url": course_data.get("thumbnail_url", ""),
            "progress_percentage": prog_data.get("progress_percentage", 0),
            "enrollment_date": enrollment_date.isoformat(),
            "last_accessed_module_id": prog_data.get("last_accessed_module_id"),
            "last_accessed_lecture_id": prog_data.get("last_accessed_lecture_id"),
        })

    return {
        "user_id": user_id,
        "enrolled_courses": enrolled_courses,
        "total": len(enrolled_courses),
    }
