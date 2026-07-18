import json
from datetime import datetime
from typing import Any
from uuid import uuid4

from google import genai

from app.core.config import settings


SYSTEM_PROMPT = """
Você é um assistente de vendas B2B que acompanha reuniões em tempo real.

Sua tarefa é analisar a transcrição recente da reunião e gerar insights úteis
para o vendedor.

Tipos permitidos:
- opportunity: quando houver oportunidade comercial, dor do cliente ou aderência com solução
- alert: quando houver objeção, risco, dúvida crítica, preço, concorrente ou insegurança
- question: quando for útil sugerir uma pergunta para o vendedor fazer

Regras:
- Gere no máximo 3 insights.
- Use português do Brasil.
- Seja objetivo.
- Não invente problemas que não aparecem na conversa.
- Não repita o mesmo insight.
- Se não houver nada relevante, retorne lista vazia.
- Responda apenas em JSON válido.
"""


RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "insights": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["opportunity", "alert", "question"],
                    },
                    "title": {
                        "type": "string",
                    },
                    "description": {
                        "type": "string",
                    },
                    "confidence": {
                        "type": "number",
                    },
                },
                "required": ["type", "title", "description", "confidence"],
            },
        }
    },
    "required": ["insights"],
}


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


def normalize_confidence(value: Any):
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return 0.5

    if confidence < 0:
        return 0

    if confidence > 1:
        return 1

    return confidence


def create_insight_from_ai(insight: dict[str, Any]):
    return {
        "id": str(uuid4()),
        "type": insight.get("type", "question"),
        "title": insight.get("title", "Insight da IA"),
        "description": insight.get("description", ""),
        "confidence": normalize_confidence(insight.get("confidence", 0.5)),
        "createdAt": datetime.utcnow().isoformat(),
    }


def parse_ai_response(response_text: str):
    try:
        data = json.loads(response_text)
    except json.JSONDecodeError:
        print("[AI] Resposta da IA não veio em JSON válido.", flush=True)
        return None

    insights = data.get("insights", [])

    if not isinstance(insights, list):
        return []

    valid_insights = []

    for insight in insights:
        if not isinstance(insight, dict):
            continue

        insight_type = insight.get("type")

        if insight_type not in ["opportunity", "alert", "question"]:
            continue

        valid_insights.append(create_insight_from_ai(insight))

    return valid_insights


def analyze_caption_with_llm(
    caption: dict[str, Any],
    recent_captions: list[dict[str, Any]] | None = None,
):
    if settings.AI_PROVIDER != "gemini":
        print(f"[AI] Provider não suportado: {settings.AI_PROVIDER}", flush=True)
        return None

    if not settings.GEMINI_API_KEY:
        print("[AI] GEMINI_API_KEY não configurada.", flush=True)
        return None

    transcript = build_transcript(
        caption=caption,
        recent_captions=recent_captions,
    )

    if not transcript:
        return []

    prompt = f"""
{SYSTEM_PROMPT}

Analise a transcrição recente da reunião e gere os insights.

Transcrição:
{transcript}
"""

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
                "response_schema": RESPONSE_SCHEMA,
            },
        )

        response_text = response.text

        if not response_text:
            return []

        return parse_ai_response(response_text)

    except Exception as error:
        print(f"[AI] Erro ao chamar Gemini: {error}", flush=True)
        return None