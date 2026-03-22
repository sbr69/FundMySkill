from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_rag_service
from app.models.requests import DocumentIngestRequest
from app.models.responses import DocumentMetadata, IngestResponse
from app.services.rag import RAGService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post(
    "/ingest",
    response_model=IngestResponse,
    summary="Ingest a document",
    description="Chunk, embed, and store a document for RAG retrieval",
)
async def ingest_document(
    request: DocumentIngestRequest,
    rag: RAGService = Depends(get_rag_service),
) -> IngestResponse:
    """Ingest a document into the RAG system."""
    result = await rag.ingest_document(
        content=request.content,
        source=request.source,
        document_id=request.document_id,
        metadata=request.metadata,
    )

    return IngestResponse(
        document_id=result["document_id"],
        chunks_created=result["chunks_created"],
        status=result["status"],
        message=f"Successfully ingested {result['chunks_created']} chunks"
        if result["status"] == "success"
        else "Document was empty or could not be chunked",
    )


@router.get(
    "/{document_id}",
    response_model=DocumentMetadata,
    summary="Get document metadata",
    description="Retrieve metadata for an ingested document",
)
async def get_document(
    document_id: str,
    rag: RAGService = Depends(get_rag_service),
) -> DocumentMetadata:
    """Get document metadata by ID."""
    doc = await rag.firebase.get_document(document_id)

    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")

    return DocumentMetadata(
        document_id=doc["document_id"],
        source=doc["source"],
        chunk_count=doc["chunk_count"],
        created_at=doc["created_at"],
        content_length=doc["content_length"],
    )


@router.delete(
    "/{document_id}",
    summary="Delete a document",
    description="Remove a document and its chunks from the system",
)
async def delete_document(
    document_id: str,
    rag: RAGService = Depends(get_rag_service),
) -> dict:
    """Delete a document and all its chunks."""
    success = await rag.delete_document(document_id)

    if not success:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")

    return {"status": "deleted", "document_id": document_id}


@router.get(
    "",
    response_model=list[DocumentMetadata],
    summary="List documents",
    description="List all ingested documents with optional source filter",
)
async def list_documents(
    source: str | None = None,
    limit: int = 100,
    rag: RAGService = Depends(get_rag_service),
) -> list[DocumentMetadata]:
    """List documents with optional filtering."""
    docs = await rag.firebase.list_documents(source=source, limit=limit)

    return [
        DocumentMetadata(
            document_id=doc["document_id"],
            source=doc["source"],
            chunk_count=doc["chunk_count"],
            created_at=doc["created_at"],
            content_length=doc["content_length"],
        )
        for doc in docs
    ]
