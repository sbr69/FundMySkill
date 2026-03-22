"""
FundMySkill Backend - FastAPI Application

EdTech platform backend with AI Tutor functionality, course management,
progress tracking, and Web3 donation verification.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import courses, progress, quizzes, ai, donations, users

# Initialize settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="FundMySkill API",
    description="Backend API for FundMySkill EdTech Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses.router)
app.include_router(progress.router)
app.include_router(quizzes.router)
app.include_router(ai.router)
app.include_router(donations.router)
app.include_router(users.router)


@app.get("/")
async def root():
    """API root - health check endpoint."""
    return {
        "name": "FundMySkill API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    from app.services.firebase import get_firestore

    db = get_firestore()

    return {
        "status": "healthy",
        "database": "mock" if db.is_mock else "firebase",
        "debug": settings.debug,
    }


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    from app.services.firebase import get_firestore
    from app.services.ai_service import get_ai_service

    # Initialize database
    db = get_firestore()
    print(f"Database initialized: {'Mock' if db.is_mock else 'Firebase'}")

    # Initialize AI service
    ai = get_ai_service()
    print(f"AI Service: {'Gemini' if ai.is_available else 'Mock'}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
