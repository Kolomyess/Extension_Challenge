from datetime import datetime
from typing import Any
from uuid import uuid4


def create_insight(
    insight_type: str,
    title: str,
    description: str,
    confidence: float,
):
    return {
        "id": str(uuid4()),
        "type": insight_type,
        "title": title,
        "description": description,
        "confidence": confidence,
        "createdAt": datetime.utcnow().isoformat(),
    }


def analyze_caption(
    caption: dict[str, Any],
    recent_captions: list[dict[str, Any]] | None = None,
):
    text = caption.get("text", "").lower()

    insights = []

    if any(
        keyword in text
        for keyword in ["rh", "folha", "férias", "ferias", "colaborador"]
    ):
        insights.append(
            create_insight(
                insight_type="opportunity",
                title="Oportunidade em RH",
                description=(
                    "Cliente mencionou um possível problema relacionado à gestão "
                    "de pessoas. Pode existir aderência com soluções de RH."
                ),
                confidence=0.78,
            )
        )

    if any(
        keyword in text
        for keyword in ["caro", "preço", "preco", "orçamento", "orcamento"]
    ):
        insights.append(
            create_insight(
                insight_type="alert",
                title="Objeção de preço detectada",
                description=(
                    "Cliente mencionou custo ou orçamento. O vendedor pode reforçar "
                    "valor, ROI e ganhos operacionais."
                ),
                confidence=0.74,
            )
        )

    if any(
        keyword in text
        for keyword in [
            "dificuldade",
            "problema",
            "não conseguimos",
            "nao conseguimos",
        ]
    ):
        insights.append(
            create_insight(
                insight_type="question",
                title="Aprofundar dor do cliente",
                description=(
                    "Pergunte como esse processo é feito hoje e quais impactos "
                    "ele gera na operação."
                ),
                confidence=0.81,
            )
        )

    return insights