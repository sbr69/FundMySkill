import uuid
from collections.abc import AsyncGenerator

from app.models.requests import MetadataFilter
from app.models.responses import ChunkMetadata, RetrievedChunk
from app.services.chunker import ChunkerService
from app.services.firebase import FirebaseService
from app.services.gemini import GeminiService
from app.services.pinecone import PineconeService


class RAGService:
    """Orchestrates the RAG pipeline: ingest, retrieve, generate."""

    def __init__(
        self,
        gemini: GeminiService,
        pinecone: PineconeService,
        firebase: FirebaseService,
        chunker: ChunkerService,
        top_k: int = 8,
    ) -> None:
        self.gemini = gemini
        self.pinecone = pinecone
        self.firebase = firebase
        self.chunker = chunker
        self.top_k = top_k

    async def ingest_document(
        self,
        content: str,
        source: str,
        document_id: str | None = None,
        metadata: dict | None = None,
    ) -> dict:
        """
        Ingest a document: chunk -> embed -> store in Pinecone + Firebase.

        Returns:
            dict with document_id and chunks_created
        """
        # Generate document ID if not provided
        doc_id = document_id or f"doc_{uuid.uuid4().hex[:12]}"

        # Chunk the document
        chunks = self.chunker.chunk_document(content, doc_id, source)

        if not chunks:
            return {
                "document_id": doc_id,
                "chunks_created": 0,
                "status": "empty_content",
            }

        # Generate embeddings for all chunks
        chunk_texts = [c["content"] for c in chunks]
        embeddings = await self.gemini.embed_batch(chunk_texts)

        # Prepare vectors for Pinecone
        vectors = [
            {
                "id": chunk["chunk_id"],
                "values": embedding,
                "metadata": {
                    "doc_id": chunk["metadata"]["doc_id"],
                    "source": chunk["metadata"]["source"],
                    "chunk_index": chunk["metadata"]["chunk_index"],
                    "char_start": chunk["metadata"]["char_start"],
                    "char_end": chunk["metadata"]["char_end"],
                    "content": chunk["content"][:1000],  # Store truncated content in metadata
                },
            }
            for chunk, embedding in zip(chunks, embeddings, strict=True)
        ]

        # Upsert to Pinecone
        await self.pinecone.upsert_vectors(vectors)

        # Store metadata in Firebase
        await self.firebase.store_document_metadata(
            document_id=doc_id,
            source=source,
            chunk_count=len(chunks),
            content_length=len(content),
            additional_metadata=metadata,
        )

        # Store chunk details in Firebase
        await self.firebase.store_chunks(chunks)

        return {
            "document_id": doc_id,
            "chunks_created": len(chunks),
            "status": "success",
        }

    async def retrieve(
        self,
        query: str,
        metadata_filter: MetadataFilter | None = None,
    ) -> list[RetrievedChunk]:
        """
        Retrieve relevant chunks for a query.

        Returns:
            List of RetrievedChunk with similarity scores
        """
        # Embed the query
        query_embedding = await self.gemini.embed_text(query)

        # Build filter dict
        filter_dict = None
        if metadata_filter:
            filter_dict = {}
            if metadata_filter.doc_id:
                filter_dict["doc_id"] = metadata_filter.doc_id
            if metadata_filter.source:
                filter_dict["source"] = metadata_filter.source

        # Query Pinecone
        results = await self.pinecone.query(
            embedding=query_embedding,
            top_k=self.top_k,
            filter_dict=filter_dict if filter_dict else None,
        )

        # Convert to RetrievedChunk models
        retrieved_chunks = []
        for result in results:
            metadata = result.get("metadata", {})

            # Fetch full content from Firebase if truncated
            content = metadata.get("content", "")
            if len(content) >= 1000:
                chunk_data = await self.firebase.get_chunks_by_ids([result["id"]])
                if chunk_data:
                    content = chunk_data[0].get("content", content)

            chunk = RetrievedChunk(
                chunk_id=result["id"],
                content=content,
                similarity_score=result["score"],
                metadata=ChunkMetadata(
                    doc_id=metadata.get("doc_id", ""),
                    source=metadata.get("source", ""),
                    chunk_index=metadata.get("chunk_index", 0),
                    char_start=metadata.get("char_start", 0),
                    char_end=metadata.get("char_end", 0),
                ),
            )
            retrieved_chunks.append(chunk)

        return retrieved_chunks

    def _build_context(self, chunks: list[RetrievedChunk]) -> str:
        """Build context string from retrieved chunks."""
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            context_parts.append(
                f"[Source {i} | Score: {chunk.similarity_score:.3f} | {chunk.metadata.source}]\n{chunk.content}"
            )
        return "\n\n---\n\n".join(context_parts)

    async def query(
        self,
        question: str,
        metadata_filter: MetadataFilter | None = None,
    ) -> tuple[str, list[RetrievedChunk]]:
        """
        Full RAG query: retrieve -> generate.

        Returns:
            Tuple of (answer, source_chunks)
        """
        # Retrieve relevant chunks
        chunks = await self.retrieve(question, metadata_filter)

        if not chunks:
            return "I couldn't find any relevant information to answer your question.", []

        # Build context from chunks
        context = self._build_context(chunks)

        # Generate answer
        answer = await self.gemini.generate(question, context)

        return answer, chunks

    async def query_stream(
        self,
        question: str,
        metadata_filter: MetadataFilter | None = None,
    ) -> AsyncGenerator[tuple[str, list[RetrievedChunk] | None], None]:
        """
        Streaming RAG query: retrieve -> stream generate.

        Yields:
            Tuples of (token, chunks) - chunks only sent with first token
        """
        # Retrieve relevant chunks
        chunks = await self.retrieve(question, metadata_filter)

        if not chunks:
            yield "I couldn't find any relevant information to answer your question.", []
            return

        # Build context from chunks
        context = self._build_context(chunks)

        # Stream the answer
        first_chunk = True
        async for token in self.gemini.generate_stream(question, context):
            if first_chunk:
                yield token, chunks
                first_chunk = True
            else:
                yield token, None

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document from both Pinecone and Firebase."""
        # Delete from Pinecone
        await self.pinecone.delete_by_metadata({"doc_id": document_id})

        # Delete from Firebase
        return await self.firebase.delete_document(document_id)
