import asyncio
from collections.abc import AsyncGenerator
from typing import Any

from fastapi import HTTPException
from google import genai
from google.genai import types

from app.config import Settings


class GeminiService:
    """Async Gemini client for embeddings and generation."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client = None
        self.embedding_model = settings.gemini_embedding_model
        self.generation_model = settings.gemini_generation_model

    @property
    def client(self):
        if self._client is None:
            if not self.settings.gemini_api_key or self.settings.gemini_api_key == "test_key":
                raise HTTPException(
                    status_code=503,
                    detail="Gemini API key not configured. Set GEMINI_API_KEY in .env",
                )
            self._client = genai.Client(api_key=self.settings.gemini_api_key)
        return self._client

    async def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.client.models.embed_content(
                model=self.embedding_model,
                contents=text,
                config=types.EmbedContentConfig(output_dimensionality=768),
            ),
        )
        return list(result.embeddings[0].values)

    async def embed_batch(self, texts: list[str], batch_size: int = 100) -> list[list[float]]:
        """Generate embeddings for multiple texts with batching."""
        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            tasks = [self.embed_text(text) for text in batch]
            batch_embeddings = await asyncio.gather(*tasks)
            all_embeddings.extend(batch_embeddings)

        return all_embeddings

    async def generate(
        self,
        prompt: str,
        context: str,
        response_schema: dict[str, Any] | None = None,
    ) -> str:
        """Generate response using Gemini with optional structured output."""
        system_instruction = """You are a helpful AI assistant. Answer questions based on the provided context.
If the context doesn't contain relevant information, say so clearly.
Be concise and accurate."""

        full_prompt = f"""Context:
{context}

Question: {prompt}

Answer based on the context above:"""

        loop = asyncio.get_event_loop()

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            max_output_tokens=2048,
        )

        if response_schema:
            config.response_mime_type = "application/json"
            config.response_schema = response_schema

        result = await loop.run_in_executor(
            None,
            lambda: self.client.models.generate_content(
                model=self.generation_model,
                contents=full_prompt,
                config=config,
            ),
        )

        return result.text or ""

    async def generate_stream(
        self,
        prompt: str,
        context: str,
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens from Gemini."""
        system_instruction = """You are a helpful AI assistant. Answer questions based on the provided context.
If the context doesn't contain relevant information, say so clearly.
Be concise and accurate."""

        full_prompt = f"""Context:
{context}

Question: {prompt}

Answer based on the context above:"""

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            max_output_tokens=2048,
        )

        loop = asyncio.get_event_loop()

        # Get streaming response
        response = await loop.run_in_executor(
            None,
            lambda: self.client.models.generate_content_stream(
                model=self.generation_model,
                contents=full_prompt,
                config=config,
            ),
        )

        for chunk in response:
            if chunk.text:
                yield chunk.text
