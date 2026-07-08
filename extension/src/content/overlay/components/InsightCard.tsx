import type { InsightMessage } from "../../../shared/types/insights";

interface InsightCardProps {
  insight: InsightMessage;
}

const LABELS = {
  opportunity: "Oportunidade",
  alert: "Alerta",
  question: "Pergunta sugerida"
} as const;

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <article className={`asa-card asa-card--${insight.type}`}>
      <strong>{LABELS[insight.type]}</strong>

      <h3>{insight.title}</h3>

      <p>{insight.description}</p>

      {typeof insight.confidence === "number" && (
        <small>Confiança: {Math.round(insight.confidence * 100)}%</small>
      )}
    </article>
  );
}