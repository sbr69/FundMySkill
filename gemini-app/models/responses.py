from pydantic import BaseModel, Field
from enum import Enum


class StreamEventType(str, Enum):
    CHUNK = "chunk"
    SOURCES = "sources"
    DONE = "done"
    ERROR = "error"


class ChunkMetadata(BaseModel):
    doc_id: str
    source: str
    chunk_index: int
    char_start: int
    char_end: int


class RetrievedChunk(BaseModel):
    chunk_id: str = Field(..., description="Unique chunk identifier")
    content: str = Field(..., description="Chunk text content")
    similarity_score: float = Field(..., ge=0, le=1, description="Cosine similarity score")
    metadata: ChunkMetadata = Field(..., description="Chunk metadata")


class ChatResponse(BaseModel):
    answer: str = Field(..., description="Generated answer")
    sources: list[RetrievedChunk] = Field(default_factory=list, description="Retrieved source chunks")
    query: str = Field(..., description="Original query")
    model: str = Field(..., description="Model used for generation")

    model_config = {"json_schema_extra": {"example": {"answer": "Machine learning is...", "sources": [{"chunk_id": "chunk_001", "content": "ML is a subset...", "similarity_score": 0.92, "metadata": {"doc_id": "doc_001", "source": "ml_docs", "chunk_index": 0, "char_start": 0, "char_end": 500}}], "query": "What is ML?", "model": "gemini-2.0-flash-lite"}}}


class StreamEvent(BaseModel):
    event: StreamEventType
    data: str | list[RetrievedChunk] | None = None


class IngestResponse(BaseModel):
    document_id: str = Field(..., description="Document ID")
    chunks_created: int = Field(..., ge=0, description="Number of chunks created")
    status: str = Field(default="success", description="Ingestion status")
    message: str | None = Field(default=None, description="Optional status message")

    model_config = {"json_schema_extra": {"example": {"document_id": "doc_001", "chunks_created": 15, "status": "success"}}}


class DocumentMetadata(BaseModel):
    document_id: str
    source: str
    chunk_count: int
    created_at: str
    content_length: int


class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: str | None = Field(default=None, description="Detailed error info")
