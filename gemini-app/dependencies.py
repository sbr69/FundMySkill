from app.config import get_settings
from app.services.chunker import ChunkerService
from app.services.firebase import FirebaseService
from app.services.gemini import GeminiService
from app.services.pinecone import PineconeService
from app.services.rag import RAGService


def get_gemini_service() -> GeminiService:
    """Get Gemini service instance."""
    return GeminiService(get_settings())


def get_pinecone_service() -> PineconeService:
    """Get Pinecone service instance."""
    return PineconeService(get_settings())


def get_firebase_service() -> FirebaseService:
    """Get Firebase service instance."""
    return FirebaseService(get_settings())


def get_chunker_service() -> ChunkerService:
    """Get Chunker service instance."""
    settings = get_settings()
    return ChunkerService(
        chunk_size=settings.chunk_size,
        overlap=settings.chunk_overlap,
    )


def get_rag_service() -> RAGService:
    """Get RAG service instance."""
    settings = get_settings()
    return RAGService(
        gemini=get_gemini_service(),
        pinecone=get_pinecone_service(),
        firebase=get_firebase_service(),
        chunker=get_chunker_service(),
        top_k=settings.top_k,
    )
