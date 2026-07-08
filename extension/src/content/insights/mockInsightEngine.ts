import type { CaptionMessage } from "../../shared/types/captions";
import type { InsightMessage } from "../../shared/types/insights";

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function generateMockInsightsFromCaption(
  caption: CaptionMessage
): InsightMessage[] {
  const text = caption.text.toLowerCase();

  const insights: InsightMessage[] = [];

  if (
    text.includes("rh") ||
    text.includes("folha") ||
    text.includes("férias") ||
    text.includes("colaborador")
  ) {
    insights.push({
      id: createId(),
      type: "opportunity",
      title: "Oportunidade em RH",
      description:
        "Cliente mencionou um possível problema relacionado à gestão de pessoas. Pode existir aderência com soluções de RH.",
      confidence: 0.78,
      createdAt: new Date().toISOString()
    });
  }

  if (
    text.includes("caro") ||
    text.includes("preço") ||
    text.includes("orçamento")
  ) {
    insights.push({
      id: createId(),
      type: "alert",
      title: "Objeção de preço detectada",
      description:
        "Cliente mencionou custo ou orçamento. O vendedor pode reforçar valor, ROI e ganhos operacionais.",
      confidence: 0.74,
      createdAt: new Date().toISOString()
    });
  }

  if (
    text.includes("dificuldade") ||
    text.includes("problema") ||
    text.includes("não conseguimos")
  ) {
    insights.push({
      id: createId(),
      type: "question",
      title: "Aprofundar dor do cliente",
      description:
        "Pergunte como esse processo é feito hoje e quais impactos ele gera na operação.",
      confidence: 0.81,
      createdAt: new Date().toISOString()
    });
  }

  return insights;
}