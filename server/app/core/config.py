import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    PROJECT_NAME = "AI Sales Assistant API"
    VERSION = "0.1.0"

    ANALYZER_MODE = os.getenv("ANALYZER_MODE", "mock")

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    ALLOWED_ORIGINS = [
        "https://teams.microsoft.com",
        "https://teams.live.com",
        "http://localhost:5173",
    ]


settings = Settings()