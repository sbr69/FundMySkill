import re
from dataclasses import dataclass


@dataclass(slots=True)
class Chunk:
    content: str
    index: int
    char_start: int
    char_end: int


class ChunkerService:
    """Sentence-aware text chunker with overlap."""

    SENTENCE_PATTERN = re.compile(r"(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$")

    def __init__(self, chunk_size: int = 500, overlap: int = 50) -> None:
        self.chunk_size = chunk_size
        self.overlap = overlap

    def _split_sentences(self, text: str) -> list[str]:
        """Split text into sentences without breaking mid-sentence."""
        sentences = self.SENTENCE_PATTERN.split(text)
        return [s.strip() for s in sentences if s.strip()]

    def chunk_text(self, text: str) -> list[Chunk]:
        """
        Split text into chunks of ~chunk_size chars with overlap.
        Never breaks mid-sentence.
        """
        if not text or not text.strip():
            return []

        text = text.strip()
        sentences = self._split_sentences(text)

        if not sentences:
            return [Chunk(content=text, index=0, char_start=0, char_end=len(text))]

        chunks: list[Chunk] = []
        current_chunk: list[str] = []
        current_length = 0
        chunk_start = 0
        text_pos = 0

        for sentence in sentences:
            sentence_len = len(sentence)

            if current_length + sentence_len > self.chunk_size and current_chunk:
                chunk_content = " ".join(current_chunk)
                chunk_end = text_pos

                chunks.append(
                    Chunk(
                        content=chunk_content,
                        index=len(chunks),
                        char_start=chunk_start,
                        char_end=chunk_end,
                    )
                )

                # Calculate overlap: keep sentences from end until we have ~overlap chars
                overlap_sentences: list[str] = []
                overlap_len = 0
                for s in reversed(current_chunk):
                    if overlap_len + len(s) > self.overlap and overlap_sentences:
                        break
                    overlap_sentences.insert(0, s)
                    overlap_len += len(s) + 1

                # Find the start position for the new chunk
                if overlap_sentences:
                    overlap_text = " ".join(overlap_sentences)
                    chunk_start = chunk_end - len(overlap_text)
                else:
                    chunk_start = text_pos

                current_chunk = overlap_sentences.copy()
                current_length = overlap_len

            current_chunk.append(sentence)
            current_length += sentence_len + 1
            text_pos += sentence_len + 1

        # Add final chunk
        if current_chunk:
            chunk_content = " ".join(current_chunk)
            chunks.append(
                Chunk(
                    content=chunk_content,
                    index=len(chunks),
                    char_start=chunk_start,
                    char_end=len(text),
                )
            )

        return chunks

    def chunk_document(self, content: str, doc_id: str, source: str) -> list[dict]:
        """Chunk document and return with metadata ready for embedding."""
        chunks = self.chunk_text(content)
        return [
            {
                "chunk_id": f"{doc_id}_chunk_{chunk.index}",
                "content": chunk.content,
                "metadata": {
                    "doc_id": doc_id,
                    "source": source,
                    "chunk_index": chunk.index,
                    "char_start": chunk.char_start,
                    "char_end": chunk.char_end,
                },
            }
            for chunk in chunks
        ]
