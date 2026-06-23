from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "GeoKurra"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    SECRET_KEY: str = "change-this-to-a-very-long-random-secret-key-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/geokurra"

    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    BHUNAKSHA_BASE_URL: str = "https://bhunaksha.bihar.gov.in"

    UPLOAD_DIR: str = "uploads/documents"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
