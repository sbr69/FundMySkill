from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Firebase
    firebase_project_id: str = "fundmyskill-dev"
    firebase_credentials_path: Optional[str] = None

    # Google AI
    gemini_api_key: Optional[str] = None

    # Application
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    debug: bool = True

    # Algorand
    algorand_node_url: str = "https://testnet-api.algonode.cloud"
    algorand_indexer_url: str = "https://testnet-idx.algonode.cloud"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
