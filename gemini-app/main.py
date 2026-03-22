from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import chat_router, documents_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan for startup/shutdown events."""
    # Startup: initialize services
    settings = get_settings()

    # Pre-warm connections (services are lazily initialized on first use)

    yield

    # Shutdown: cleanup if needed
    pass


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="RAG Chatbot API",
        description="High-performance RAG-based chatbot with Gemini, Pinecone, and Firebase",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(chat_router)
    app.include_router(documents_router)

    @app.get("/health", tags=["health"])
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy", "version": "1.0.0"}

    @app.get("/", tags=["root"])
    async def root():
        """Root endpoint."""
        return {
            "message": "RAG Chatbot API",
            "docs": "/docs",
            "health": "/health",
        }

    return app


app = create_app()
