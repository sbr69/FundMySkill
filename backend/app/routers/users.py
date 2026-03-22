"""
Users router - handles user management with pass-through authentication.
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime

from app.services.firebase import get_firestore, datetime_to_firestore
from app.models.user import UserCreate, UserResponse

router = APIRouter(prefix="/api/users", tags=["users"])


def get_mock_user_id(x_mock_user_id: Optional[str] = Header(None)) -> str:
    """
    Get user ID from header or generate a fallback.
    Implements pass-through authentication for MVP.
    """
    if x_mock_user_id:
        return x_mock_user_id
    return "mock-fallback-user"


@router.get("/me")
async def get_current_user(x_mock_user_id: Optional[str] = Header(None)) -> dict:
    """
    Get current user profile.
    Creates a mock user if it doesn't exist.
    """
    db = get_firestore()
    user_id = get_mock_user_id(x_mock_user_id)

    user_doc = db.collection("users").document(user_id).get()

    if user_doc.exists:
        user_data = user_doc.to_dict()
        return {
            "id": user_id,
            **user_data,
        }

    # Create mock user
    new_user = {
        "name": f"User {user_id[:8]}",
        "avatar_url": f"https://i.pravatar.cc/150?u={user_id}",
        "bio": "EdTech enthusiast",
        "skills": ["Python", "Machine Learning"],
        "role": "student",
        "joined_at": datetime_to_firestore(datetime.utcnow()),
    }

    db.collection("users").document(user_id).set(new_user)

    return {
        "id": user_id,
        **new_user,
    }


@router.get("/{user_id}")
async def get_user(user_id: str) -> dict:
    """
    Get a user by ID.
    """
    db = get_firestore()

    user_doc = db.collection("users").document(user_id).get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    return {
        "id": user_id,
        **user_data,
    }


@router.post("")
async def create_user(user: UserCreate, x_mock_user_id: Optional[str] = Header(None)) -> dict:
    """
    Create or update a user profile.
    """
    db = get_firestore()
    user_id = get_mock_user_id(x_mock_user_id)

    user_data = {
        "name": user.name,
        "avatar_url": user.avatar_url or f"https://i.pravatar.cc/150?u={user_id}",
        "bio": user.bio,
        "skills": user.skills,
        "role": user.role,
        "joined_at": datetime_to_firestore(datetime.utcnow()),
    }

    db.collection("users").document(user_id).set(user_data, merge=True)

    return {
        "id": user_id,
        **user_data,
    }


@router.patch("/{user_id}")
async def update_user(user_id: str, updates: dict) -> dict:
    """
    Update user profile fields.
    """
    db = get_firestore()

    user_doc = db.collection("users").document(user_id).get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    # Filter allowed fields
    allowed_fields = {"name", "avatar_url", "bio", "skills", "role"}
    filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}

    if filtered_updates:
        db.collection("users").document(user_id).update(filtered_updates)

    # Get updated user
    user_doc = db.collection("users").document(user_id).get()
    user_data = user_doc.to_dict()

    return {
        "id": user_id,
        **user_data,
    }


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str) -> dict:
    """
    Get user learning statistics.
    """
    db = get_firestore()

    # Get enrolled courses count and progress
    progress_docs = list(
        db.collection("user_progress")
        .where("user_id", "==", user_id)
        .stream()
    )

    enrolled_count = len(progress_docs)
    completed_count = 0
    total_progress = 0

    for prog_doc in progress_docs:
        prog_data = prog_doc.to_dict()
        progress = prog_data.get("progress_percentage", 0)
        total_progress += progress
        if progress >= 100:
            completed_count += 1

    avg_progress = total_progress / enrolled_count if enrolled_count > 0 else 0

    # Get quiz stats
    attempt_docs = list(
        db.collection("quiz_attempts")
        .where("user_id", "==", user_id)
        .stream()
    )

    quiz_count = len(attempt_docs)
    total_accuracy = 0

    for attempt_doc in attempt_docs:
        attempt_data = attempt_doc.to_dict()
        total_accuracy += attempt_data.get("accuracy_percentage", 0)

    avg_accuracy = total_accuracy / quiz_count if quiz_count > 0 else 0

    return {
        "user_id": user_id,
        "enrolled_courses": enrolled_count,
        "completed_courses": completed_count,
        "average_progress": round(avg_progress, 1),
        "quizzes_taken": quiz_count,
        "average_quiz_accuracy": round(avg_accuracy, 1),
    }
