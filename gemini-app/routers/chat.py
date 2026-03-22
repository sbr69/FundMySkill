import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.dependencies import get_rag_service
from app.models.requests import ChatRequest
from app.models.responses import ChatResponse, RetrievedChunk, StreamEventType
from app.services.rag import RAGService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "",
    response_class=StreamingResponse,
    summary="Chat with RAG (Streaming)",
    description="Query the RAG system and receive streaming response via SSE",
)
async def chat_stream(
    request: ChatRequest,
    rag: RAGService = Depends(get_rag_service),
) -> StreamingResponse:
    """Stream chat response using Server-Sent Events."""

    async def generate_sse():
        sources_sent = False

        async for token, chunks in rag.query_stream(
            question=request.query,
            metadata_filter=request.metadata_filter,
        ):
            # Send sources with first chunk
            if chunks is not None and not sources_sent:
                sources_data = [chunk.model_dump() for chunk in chunks]
                yield f"event: {StreamEventType.SOURCES.value}\ndata: {json.dumps(sources_data)}\n\n"
                sources_sent = True

            # Send token
            yield f"event: {StreamEventType.CHUNK.value}\ndata: {json.dumps({'text': token})}\n\n"

        # Send done event
        yield f"event: {StreamEventType.DONE.value}\ndata: {json.dumps({'status': 'complete'})}\n\n"

    return StreamingResponse(
        generate_sse(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/sync",
    response_model=ChatResponse,
    summary="Chat with RAG (Synchronous)",
    description="Query the RAG system and receive complete JSON response",
)
async def chat_sync(
    request: ChatRequest,
    rag: RAGService = Depends(get_rag_service),
) -> ChatResponse:
    """Non-streaming chat endpoint returning complete response."""
    answer, sources = await rag.query(
        question=request.query,
        metadata_filter=request.metadata_filter,
    )

    return ChatResponse(
        answer=answer,
        sources=sources,
        query=request.query,
        model=rag.gemini.generation_model,
    )


@router.post(
    "/retrieve",
    response_model=list[RetrievedChunk],
    summary="Retrieve relevant chunks",
    description="Retrieve relevant chunks without generating an answer",
)
async def retrieve_chunks(
    request: ChatRequest,
    rag: RAGService = Depends(get_rag_service),
) -> list[RetrievedChunk]:
    """Retrieve relevant chunks for a query without LLM generation."""
    chunks = await rag.retrieve(
        query=request.query,
        metadata_filter=request.metadata_filter,
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant chunks found")

    return chunks
