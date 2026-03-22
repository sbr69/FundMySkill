"""
AI router - handles AI tutor chat and quiz generation.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from app.services.firebase import get_firestore, datetime_to_firestore
from app.services.ai_service import get_ai_service
from app.models.ai import TutorChatRequest, TutorChatResponse, ChatMessage
from app.models.quiz import GenerateQuizRequest, GenerateQuizResponse, ContextSource

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/tutor/chat")
async def tutor_chat(request: TutorChatRequest) -> TutorChatResponse:
    """
    Send a message to the AI tutor and get a response.
    Maintains session history for context.
    """
    db = get_firestore()
    ai_service = get_ai_service()

    # Get or create session
    session_query = (
        db.collection("ai_sessions")
        .where("user_id", "==", request.user_id)
        .where("lecture_id", "==", request.lecture_id)
        .limit(1)
    )
    session_docs = list(session_query.stream())

    session_id = None
    chat_history = []

    if session_docs:
        session_id = session_docs[0].id
        session_data = session_docs[0].to_dict()
        chat_history = session_data.get("messages", [])
    else:
        session_id = str(uuid.uuid4())

    # Get lecture context
    lecture_context = ""
    lecture_title = "Unknown Lecture"

    # Find the lecture in the database
    courses_docs = list(db.collection("courses").stream())
    for course_doc in courses_docs:
        module_docs = list(
            db.collection("courses")
            .document(course_doc.id)
            .collection("modules")
            .stream()
        )
        for mod_doc in module_docs:
            lecture_doc = (
                db.collection("courses")
                .document(course_doc.id)
                .collection("modules")
                .document(mod_doc.id)
                .collection("lectures")
                .document(request.lecture_id)
                .get()
            )
            if lecture_doc.exists:
                lec_data = lecture_doc.to_dict()
                lecture_title = lec_data.get("title", lecture_title)
                lecture_context = lec_data.get("description", "")

                # Add resource summaries if available
                resources = lec_data.get("resources", [])
                if resources:
                    lecture_context += "\n\nRelated Resources:\n"
                    for r in resources:
                        lecture_context += f"- {r.get('title', 'Resource')}\n"
                break

    # Get AI response
    response_text, suggested_prompts = await ai_service.get_tutor_response(
        user_message=request.message,
        lecture_context=lecture_context,
        chat_history=chat_history,
    )

    # Add messages to history
    now = datetime_to_firestore(datetime.utcnow())
    chat_history.append({
        "role": "user",
        "content": request.message,
        "timestamp": now,
    })
    chat_history.append({
        "role": "ai",
        "content": response_text,
        "timestamp": now,
    })

    # Save session
    session_data = {
        "user_id": request.user_id,
        "lecture_id": request.lecture_id,
        "messages": chat_history,
        "updated_at": now,
    }

    if not session_docs:
        session_data["created_at"] = now

    db.collection("ai_sessions").document(session_id).set(session_data, merge=True)

    return TutorChatResponse(
        response=response_text,
        suggested_prompts=suggested_prompts,
        session_id=session_id,
    )


@router.post("/quiz/generate")
async def generate_quiz(request: GenerateQuizRequest) -> GenerateQuizResponse:
    """
    Generate an AI-powered quiz based on lecture content.
    """
    db = get_firestore()
    ai_service = get_ai_service()

    # Find the lecture
    lecture_data = None
    lecture_title = "Generated Quiz"
    lecture_description = ""

    courses_docs = list(db.collection("courses").stream())
    for course_doc in courses_docs:
        module_docs = list(
            db.collection("courses")
            .document(course_doc.id)
            .collection("modules")
            .stream()
        )
        for mod_doc in module_docs:
            lecture_doc = (
                db.collection("courses")
                .document(course_doc.id)
                .collection("modules")
                .document(mod_doc.id)
                .collection("lectures")
                .document(request.lecture_id)
                .get()
            )
            if lecture_doc.exists:
                lecture_data = lecture_doc.to_dict()
                lecture_title = lecture_data.get("title", lecture_title)
                lecture_description = lecture_data.get("description", "")
                break
        if lecture_data:
            break

    if not lecture_data:
        raise HTTPException(status_code=404, detail="Lecture not found")

    # Build context from lecture
    lecture_context = f"""
Title: {lecture_title}
Description: {lecture_description}
"""

    # Add resource info
    resources = lecture_data.get("resources", [])
    if resources:
        lecture_context += "\nTopics covered:\n"
        for r in resources:
            lecture_context += f"- {r.get('title', 'Topic')}\n"

    # Generate quiz questions
    questions = await ai_service.generate_quiz(
        lecture_title=lecture_title,
        lecture_description=lecture_description,
        lecture_context=lecture_context,
    )

    # Create quiz document
    quiz_id = f"ai-generated-{uuid.uuid4().hex[:8]}"
    quiz_data = {
        "context_source": {
            "type": "lecture",
            "id": request.lecture_id,
        },
        "title": f"AI Quiz: {lecture_title}",
        "time_limit_seconds": 900,  # 15 minutes
        "questions": [q.model_dump() for q in questions],
        "created_at": datetime_to_firestore(datetime.utcnow()),
        "generated_for_user": request.user_id,
    }

    db.collection("quizzes").document(quiz_id).set(quiz_data)

    return GenerateQuizResponse(
        quiz_id=quiz_id,
        title=quiz_data["title"],
        question_count=len(questions),
    )


@router.get("/sessions/{user_id}/{lecture_id}")
async def get_session_history(user_id: str, lecture_id: str) -> dict:
    """
    Get chat history for a user/lecture session.
    """
    db = get_firestore()

    session_query = (
        db.collection("ai_sessions")
        .where("user_id", "==", user_id)
        .where("lecture_id", "==", lecture_id)
        .limit(1)
    )
    session_docs = list(session_query.stream())

    if not session_docs:
        return {
            "session_id": None,
            "messages": [],
            "lecture_id": lecture_id,
        }

    session_data = session_docs[0].to_dict()

    return {
        "session_id": session_docs[0].id,
        "messages": session_data.get("messages", []),
        "lecture_id": lecture_id,
    }


@router.delete("/sessions/{session_id}")
async def clear_session(session_id: str) -> dict:
    """
    Clear a chat session history.
    """
    db = get_firestore()

    session_doc = db.collection("ai_sessions").document(session_id).get()
    if not session_doc.exists:
        raise HTTPException(status_code=404, detail="Session not found")

    db.collection("ai_sessions").document(session_id).delete()

    return {
        "success": True,
        "message": "Session cleared",
    }
