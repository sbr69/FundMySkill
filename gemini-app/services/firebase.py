import json
import os
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import HTTPException

from app.config import Settings


class FirebaseService:
    """Firebase Firestore client for document metadata."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._db = None
        self._initialized = False
        self._init_error: str | None = None

    def _get_db(self):
        """Initialize Firebase and get Firestore client."""
        if self._init_error:
            raise HTTPException(status_code=503, detail=f"Firebase not configured: {self._init_error}")

        if not self._initialized:
            cred_path = self.settings.firebase_credentials_path
            if not cred_path or not os.path.exists(cred_path):
                self._init_error = f"Credentials file not found: {cred_path}"
                raise HTTPException(status_code=503, detail=f"Firebase not configured: {self._init_error}")

            try:
                firebase_admin.get_app()
            except ValueError:
                cred = credentials.Certificate(cred_path)

                # Extract project_id from credentials if not set in env
                project_id = self.settings.firebase_project_id
                if not project_id:
                    with open(cred_path, encoding="utf-8") as f:
                        cred_data = json.load(f)
                        project_id = cred_data.get("project_id")

                firebase_admin.initialize_app(
                    cred,
                    {"projectId": project_id} if project_id else None,
                )
            self._db = firestore.client()
            self._initialized = True
        return self._db

    async def store_document_metadata(
        self,
        document_id: str,
        source: str,
        chunk_count: int,
        content_length: int,
        additional_metadata: dict | None = None,
    ) -> dict:
        """Store document metadata in Firestore."""
        db = self._get_db()

        doc_data = {
            "document_id": document_id,
            "source": source,
            "chunk_count": chunk_count,
            "content_length": content_length,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        if additional_metadata:
            doc_data["metadata"] = additional_metadata

        db.collection("documents").document(document_id).set(doc_data)

        return doc_data

    async def get_document(self, document_id: str) -> dict | None:
        """Get document metadata by ID."""
        db = self._get_db()
        doc = db.collection("documents").document(document_id).get()

        if doc.exists:
            return doc.to_dict()
        return None

    async def delete_document(self, document_id: str) -> bool:
        """Delete document and its chunks from Firestore."""
        db = self._get_db()

        # Delete document
        doc_ref = db.collection("documents").document(document_id)
        if not doc_ref.get().exists:
            return False

        doc_ref.delete()

        # Delete associated chunks
        chunks_ref = db.collection("chunks").where("doc_id", "==", document_id)
        for chunk in chunks_ref.stream():
            chunk.reference.delete()

        return True

    async def store_chunks(
        self,
        chunks: list[dict],
    ) -> int:
        """Store chunk metadata in Firestore batch."""
        db = self._get_db()
        batch = db.batch()

        for chunk in chunks:
            chunk_ref = db.collection("chunks").document(chunk["chunk_id"])
            chunk_data = {
                "chunk_id": chunk["chunk_id"],
                "doc_id": chunk["metadata"]["doc_id"],
                "source": chunk["metadata"]["source"],
                "chunk_index": chunk["metadata"]["chunk_index"],
                "char_start": chunk["metadata"]["char_start"],
                "char_end": chunk["metadata"]["char_end"],
                "content": chunk["content"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            batch.set(chunk_ref, chunk_data)

        batch.commit()
        return len(chunks)

    async def get_chunks_by_ids(self, chunk_ids: list[str]) -> list[dict]:
        """Get chunk data by IDs."""
        db = self._get_db()
        chunks = []

        for chunk_id in chunk_ids:
            doc = db.collection("chunks").document(chunk_id).get()
            if doc.exists:
                chunks.append(doc.to_dict())

        return chunks

    async def list_documents(
        self,
        source: str | None = None,
        limit: int = 100,
    ) -> list[dict]:
        """List documents with optional source filter."""
        db = self._get_db()
        query = db.collection("documents")

        if source:
            query = query.where("source", "==", source)

        query = query.limit(limit)

        return [doc.to_dict() for doc in query.stream()]
