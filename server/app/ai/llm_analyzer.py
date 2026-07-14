from datetime import datetime
from typing import Any, Literal
from uuid import uuid4

from openai import OpenAI
from pydantic import BaseModel, Field

from app.core.config import settings


class LLMInsight(BaseModel):
    type: Literal["opportunity", "alert", "question"]
    title: str = Field(description="Título curto do insight")
    description: str = Field(description="Descrição objetiva para o vendedor")
    confidence: float = Field(
        ge=0,
        le=1,
        description="Confiança do insight entre 0 e 1",
    )


class LLMAnalysisResult(BaseModel):
    insights: list[LLMInsight] = Field(
        default_factory=list,
        description="Lista de insights gerados para o vendedor",
    )


SYSTEM_PROMPT = """
Você é um assistente de vendas B2B que acompanha reuniões em tempo real.

Sua tarefa é analisar a transcrição recente da reunião e gerar insights úteis
para o vendedor.

Gere apenas insights realmente úteis. Não invente problemas que não aparecem
na conversa.

Tipos permitidos:
- opportunity: quando houver oportunidade comercial, dor do cliente ou aderência com solução
- alert: quando houver objeção, risco, dúvida crítica, preço, concorrente ou insegurança
- question: quando for útil sugerir uma pergunta para o vendedor fazer

Regras:
- Gere no máximo 3 insights.
- Use português do Brasil.
- Seja objetivo.
- Não repita o mesmo insight.
- Se não houver nada relevante, retorne lista vazia.
"""


def build_transcript(
    caption: dict[str, Any],
    recent_captions: list[dict[str, Any]] | None = None,
):
    recent_captions = recent_captions or []

    lines = []

    for item in recent_captions[-10:]:
        speaker = item.get("speaker", "Participante")
        text = item.get("text", "")

        if text:
            lines.append(f"{speaker}: {text}")

    current_speaker = caption.get("speaker", "Participante")
    current_text = caption.get("text", "")

    if current_text:
        lines.append(f"{current_speaker}: {current_text}")

    return "\n".join(lines)


def create_insight_from_llm(insight: LLMInsight):
    return {
        "id": str(uuid4()),
        "type": insight.type,
        "title": insight.title,
        "description": insight.description,
        "confidence": insight.confidence,
        "createdAt": datetime.utcnow().isoformat(),
    }


def analyze_caption_with_llm(
    caption: dict[str, Any],
    recent_captions: list[dict[str, Any]] | None = None,
):
    if not settings.OPENAI_API_KEY:
        print("[AI] OPENAI_API_KEY não configurada.", flush=True)
        return None

    transcript = build_transcript(
        caption=caption,
        recent_captions=recent_captions,
    )

    if not transcript:
        return []

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        completion = client.chat.completions.parse(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": (
                        "Analise a transcrição recente da reunião e gere insights.\n\n"
                        f"Transcrição:\n{transcript}"
                    ),
                },
            ],
            response_format=LLMAnalysisResult,
        )

        parsed_result = completion.choices[0].message.parsed

        if not parsed_result:
            return []

        return [
            create_insight_from_llm(insight)
            for insight in parsed_result.insights
        ]

    except Exception as error:
        print(f"[AI] Erro ao chamar LLM: {error}", flush=True)
        return None