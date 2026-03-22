from pydantic import BaseModel, Field


class MetadataFilter(BaseModel):
    doc_id: str | None = Field(default=None, description="Filter by document ID")
    source: str | None = Field(default=None, description="Filter by source name")


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=10000, description="User query")
    conversation_id: str | None = Field(default=None, description="Conversation ID for context")
    metadata_filter: MetadataFilter | None = Field(default=None, description="Optional metadata filters")

    model_config = {"json_schema_extra": {"example": {"query": "What is machine learning?", "conversation_id": "conv_123", "metadata_filter": {"source": "ml_docs"}}}}


class DocumentIngestRequest(BaseModel):
    content: str = Field(..., min_length=1, description="Document content to ingest")
    document_id: str | None = Field(default=None, description="Custom document ID (auto-generated if not provided)")
    source: str = Field(..., min_length=1, max_length=255, description="Source identifier")
    metadata: dict | None = Field(default=None, description="Additional metadata")

    model_config = {"json_schema_extra": {"example": {"content": "Machine learning is a subset of AI...", "source": "ml_documentation", "document_id": "doc_001"}}}


class DocumentQueryRequest(BaseModel):
    doc_id: str = Field(..., description="Document ID to query")
