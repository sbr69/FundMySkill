from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the directory where this config file is located (app/)
_APP_DIR = Path(__file__).parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_APP_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Gemini
    gemini_api_key: str
    gemini_embedding_model: str = "gemini-embedding-001"
    gemini_generation_model: str = "gemini-2.0-flash-lite"

    # Pinecone
    pinecone_api_key: str
    pinecone_index_name: str
    pinecone_environment: str = "us-east-1"

    # Firebase
    firebase_project_id: str | None = None  # Auto-extracted from credentials if not set
    firebase_credentials_path: str = "firebase-credentials.json"

    # RAG settings
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k: int = 8

    # App settings
    debug: bool = False
    cors_origins: list[str] = ["*"]


def get_settings() -> Settings:
    return Settings()
