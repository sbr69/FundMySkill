"""
Quiz router - handles quiz retrieval, submission, and results.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from app.services.firebase import get_firestore, datetime_to_firestore
from app.models.quiz import (
    Quiz,
    QuizResponse,
    QuizAttempt,
    SubmitQuizRequest,
    QuizResultResponse,
)

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str) -> dict:
    """
    Get a quiz by ID.
    Returns the quiz structure for CourseQuizPage.
    """
    db = get_firestore()

    quiz_doc = db.collection("quizzes").document(quiz_id).get()
    if not quiz_doc.exists:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz_data = quiz_doc.to_dict()

    questions = quiz_data.get("questions", [])
    total_points = sum(q.get("points", 1) for q in questions)

    # Remove correct answer info from options for client
    sanitized_questions = []
    for q in questions:
        sanitized_options = [
            {
                "letter": opt.get("letter"),
                "text": opt.get("text"),
            }
            for opt in q.get("options", [])
        ]
        sanitized_questions.append({
            "id": q.get("id"),
            "text": q.get("text"),
            "points": q.get("points", 1),
            "options": sanitized_options,
        })

    return {
        "id": quiz_id,
        "title": quiz_data.get("title", "Quiz"),
        "time_limit_seconds": quiz_data.get("time_limit_seconds", 900),
        "question_count": len(questions),
        "total_points": total_points,
        "questions": sanitized_questions,
        "context_source": quiz_data.get("context_source", {}),
    }


@router.post("/submit")
async def submit_quiz(request: SubmitQuizRequest) -> QuizResultResponse:
    """
    Submit quiz answers and get results.
    """
    db = get_firestore()

    # Get quiz
    quiz_doc = db.collection("quizzes").document(request.quiz_id).get()
    if not quiz_doc.exists:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz_data = quiz_doc.to_dict()
    questions = quiz_data.get("questions", [])

    # Calculate score
    score = 0
    total_points = 0
    correct_answers = {}

    for q in questions:
        q_id = q.get("id")
        points = q.get("points", 1)
        total_points += points

        # Find correct answer
        correct_letter = None
        for opt in q.get("options", []):
            if opt.get("is_correct"):
                correct_letter = opt.get("letter")
                break

        correct_answers[q_id] = correct_letter

        # Check user answer
        user_answer = request.answers.get(q_id)
        if user_answer == correct_letter:
            score += points

    # Calculate accuracy
    accuracy = 0.0
    if total_points > 0:
        accuracy = (score / total_points) * 100

    # Save attempt
    attempt_id = str(uuid.uuid4())
    attempt_data = {
        "quiz_id": request.quiz_id,
        "user_id": request.user_id,
        "score": score,
        "accuracy_percentage": round(accuracy, 1),
        "time_taken_seconds": request.time_taken_seconds,
        "answers": request.answers,
        "created_at": datetime_to_firestore(datetime.utcnow()),
    }

    db.collection("quiz_attempts").document(attempt_id).set(attempt_data)

    return QuizResultResponse(
        attempt_id=attempt_id,
        score=score,
        total_points=total_points,
        accuracy_percentage=round(accuracy, 1),
        correct_answers=correct_answers,
        time_taken_seconds=request.time_taken_seconds,
    )


@router.get("/attempts/{user_id}")
async def get_user_attempts(user_id: str, quiz_id: str = None) -> dict:
    """
    Get quiz attempts for a user.
    """
    db = get_firestore()

    query = db.collection("quiz_attempts").where("user_id", "==", user_id)
    if quiz_id:
        query = query.where("quiz_id", "==", quiz_id)

    attempt_docs = list(query.stream())

    attempts = []
    for doc in attempt_docs:
        data = doc.to_dict()
        attempts.append({
            "id": doc.id,
            "quiz_id": data.get("quiz_id"),
            "score": data.get("score"),
            "accuracy_percentage": data.get("accuracy_percentage"),
            "time_taken_seconds": data.get("time_taken_seconds"),
            "created_at": data.get("created_at"),
        })

    return {
        "user_id": user_id,
        "attempts": attempts,
        "total": len(attempts),
    }


@router.get("/course/{course_id}")
async def get_course_quizzes(course_id: str) -> dict:
    """
    Get all quizzes associated with a course.
    """
    db = get_firestore()

    # Get all modules for the course
    module_docs = list(
        db.collection("courses")
        .document(course_id)
        .collection("modules")
        .stream()
    )

    module_ids = [doc.id for doc in module_docs]

    # Get all lectures
    lecture_ids = []
    for mod_id in module_ids:
        lecture_docs = list(
            db.collection("courses")
            .document(course_id)
            .collection("modules")
            .document(mod_id)
            .collection("lectures")
            .stream()
        )
        lecture_ids.extend([doc.id for doc in lecture_docs])

    # Find quizzes for these modules and lectures
    quizzes = []

    # Get all quizzes and filter
    all_quizzes = list(db.collection("quizzes").stream())

    for quiz_doc in all_quizzes:
        quiz_data = quiz_doc.to_dict()
        context = quiz_data.get("context_source", {})
        context_type = context.get("type")
        context_id = context.get("id")

        if context_type == "module" and context_id in module_ids:
            quizzes.append({
                "id": quiz_doc.id,
                "title": quiz_data.get("title"),
                "question_count": len(quiz_data.get("questions", [])),
                "time_limit_seconds": quiz_data.get("time_limit_seconds", 900),
                "context_source": context,
            })
        elif context_type == "lecture" and context_id in lecture_ids:
            quizzes.append({
                "id": quiz_doc.id,
                "title": quiz_data.get("title"),
                "question_count": len(quiz_data.get("questions", [])),
                "time_limit_seconds": quiz_data.get("time_limit_seconds", 900),
                "context_source": context,
            })

    return {
        "course_id": course_id,
        "quizzes": quizzes,
        "total": len(quizzes),
    }
