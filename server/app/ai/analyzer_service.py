from typing import Any

from app.ai.mock_analyzer import analyze_caption as analyze_with_mock


class AnalyzerService:
    def __init__(self):
        self.mode = "mock"

    def analyze_caption(
        self,
        caption: dict[str, Any],
        recent_captions: list[dict[str, Any]] | None = None,
    ):
        if self.mode == "mock":
            return analyze_with_mock(
                caption=caption,
                recent_captions=recent_captions,
            )

        return []


analyzer_service = AnalyzerService()