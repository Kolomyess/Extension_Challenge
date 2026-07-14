import os


class Settings:
    PROJECT_NAME = "AI Sales Assistant API"
    VERSION = "0.1.0"

    ANALYZER_MODE = os.getenv("ANALYZER_MODE", "mock")

    ALLOWED_ORIGINS = [
        "https://teams.microsoft.com",
        "https://teams.live.com",
        "http://localhost:5173",
    ]


settings = Settings()