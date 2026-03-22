from fastapi import HTTPException
from pinecone import Pinecone, ServerlessSpec

from app.config import Settings


class PineconeService:
    """Pinecone vector database client."""

    EMBEDDING_DIMENSION = 768  # Gemini embedding dimension

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._pc = None
        self.index_name = settings.pinecone_index_name
        self._index = None

    @property
    def pc(self):
        if self._pc is None:
            if not self.settings.pinecone_api_key or self.settings.pinecone_api_key == "test_key":
                raise HTTPException(
                    status_code=503,
                    detail="Pinecone API key not configured. Set PINECONE_API_KEY in .env",
                )
            self._pc = Pinecone(api_key=self.settings.pinecone_api_key)
        return self._pc

    def _get_index(self):
        """Get or create the Pinecone index."""
        if self._index is None:
            # Check if index exists
            existing_indexes = [idx.name for idx in self.pc.list_indexes()]

            if self.index_name not in existing_indexes:
                self.pc.create_index(
                    name=self.index_name,
                    dimension=self.EMBEDDING_DIMENSION,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region=self.settings.pinecone_environment,
                    ),
                )

            self._index = self.pc.Index(self.index_name)

        return self._index

    async def upsert_vectors(
        self,
        vectors: list[dict],
        batch_size: int = 100,
    ) -> int:
        """
        Upsert vectors with metadata to Pinecone.

        Args:
            vectors: List of dicts with 'id', 'values', 'metadata'
            batch_size: Number of vectors per batch

        Returns:
            Number of vectors upserted
        """
        index = self._get_index()
        total_upserted = 0

        for i in range(0, len(vectors), batch_size):
            batch = vectors[i : i + batch_size]
            upsert_data = [
                {
                    "id": v["id"],
                    "values": v["values"],
                    "metadata": v["metadata"],
                }
                for v in batch
            ]
            index.upsert(vectors=upsert_data)
            total_upserted += len(batch)

        return total_upserted

    async def query(
        self,
        embedding: list[float],
        top_k: int = 8,
        filter_dict: dict | None = None,
        include_metadata: bool = True,
    ) -> list[dict]:
        """
        Query Pinecone for similar vectors.

        Args:
            embedding: Query embedding
            top_k: Number of results to return
            filter_dict: Metadata filter (e.g., {"source": "docs"})
            include_metadata: Whether to include metadata in results

        Returns:
            List of matches with id, score, and metadata
        """
        index = self._get_index()

        query_params = {
            "vector": embedding,
            "top_k": top_k,
            "include_metadata": include_metadata,
        }

        if filter_dict:
            # Build Pinecone filter
            pinecone_filter = {}
            for key, value in filter_dict.items():
                if value is not None:
                    pinecone_filter[key] = {"$eq": value}

            if pinecone_filter:
                query_params["filter"] = pinecone_filter

        results = index.query(**query_params)

        return [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata or {},
            }
            for match in results.matches
        ]

    async def delete_by_metadata(self, filter_dict: dict) -> None:
        """Delete vectors matching metadata filter."""
        index = self._get_index()

        pinecone_filter = {}
        for key, value in filter_dict.items():
            if value is not None:
                pinecone_filter[key] = {"$eq": value}

        if pinecone_filter:
            index.delete(filter=pinecone_filter)

    async def delete_by_ids(self, ids: list[str]) -> None:
        """Delete vectors by their IDs."""
        index = self._get_index()
        index.delete(ids=ids)
