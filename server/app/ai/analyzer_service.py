from datetime import datetime, timedelta
from typing import Any

from app.ai.llm_analyzer import analyze_caption_with_llm
from app.ai.mock_analyzer import analyze_caption as analyze_with_mock
from app.ai.relevance_filter import should_analyze_caption
from app.core.config import settings


LLM_COOLDOWN_SECONDS = 12


class AnalyzerService:
    def __init__(self):
        self.mode = settings.ANALYZER_MODE
        self.last_llm_call_at: datetime | None = None

    def can_call_llm(self):
        if self.last_llm_call_at is None:
            return True

        elapsed = datetime.utcnow() - self.last_llm_call_at

        return elapsed >= timedelta(seconds=LLM_COOLDOWN_SECONDS)

    def mark_llm_called(self):
        self.last_llm_call_at = datetime.utcnow()

    def analyze_caption(
        self,
        caption: dict[str, Any],
        recent_captions: list[dict[str, Any]] | None = None,
    ):
        should_analyze, reason = should_analyze_caption(
            caption=caption,
            recent_captions=recent_captions,
        )

        if not should_analyze:
            print(f"[AI] Fala ignorada: {reason}", flush=True)
            return []

        print(f"[AI] Fala relevante detectada: {reason}", flush=True)
        print(f"[AI] Modo ativo: {self.mode}", flush=True)

        if self.mode == "mock":
            return analyze_with_mock(
                caption=caption,
                recent_captions=recent_captions,
            )

        if self.mode == "llm":
            if not self.can_call_llm():
                print(
                    f"[AI] Chamada LLM ignorada para respeitar cooldown de {LLM_COOLDOWN_SECONDS}s.",
                    flush=True,
                )

                return []

            self.mark_llm_called()

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