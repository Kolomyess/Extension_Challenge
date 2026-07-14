from typing import Any

from app.ai.llm_analyzer import analyze_caption_with_llm
from app.ai.mock_analyzer import analyze_caption as analyze_with_mock
from app.core.config import settings


class AnalyzerService:
    def __init__(self):
        self.mode = settings.ANALYZER_MODE

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

        if self.mode == "llm":
            insights = analyze_caption_with_llm(
                caption=caption,
                recent_captions=recent_captions,
            )

            if insights is not None:
                return insights

            print("[AI] Usando mock como fallback.", flush=True)

            return analyze_with_mock(
                caption=caption,
                recent_captions=recent_captions,
            )

        print(f"[AI] Modo de análise desconhecido: {self.mode}", flush=True)

        return []
        

analyzer_service = AnalyzerService()