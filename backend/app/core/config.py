from pathlib import Path

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    app_name: str = "APEX INUBIL API"
    database_url: str = f"sqlite:///{BASE_DIR / 'inubil.db'}"
    secret_key: str = "change-me-dev-only-not-for-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 12

    ml_model_path: Path = BASE_DIR / "app" / "ml" / "model.pkl"
    ml_preprocessing_path: Path = BASE_DIR / "app" / "ml" / "preprocessing.pkl"

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
