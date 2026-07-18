import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)


class Settings:
    PROJECT_NAME = "AI Sales Assistant API"
    VERSION = "0.1.0"

    ANALYZER_MODE = os.getenv("ANALYZER_MODE", "mock")
    AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    ALLOWED_ORIGINS = [
        "https://teams.microsoft.com",
        "https://teams.live.com",
        "http://localhost:5173",
    ]


settings = Settings()