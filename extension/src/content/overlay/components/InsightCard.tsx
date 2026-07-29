import type { InsightMessage } from "../../../shared/types/insights";

interface InsightCardProps {
  insight: InsightMessage;
}

function getInsightLabel(type: InsightMessage["type"]) {
  switch (type) {
    case "alert":
      return "Alerta";

    case "question":
      return "Pergunta sugerida";

    case "opportunity":
      return "Oportunidade";

    default:
      return "Insight";
  }
}

function getInsightClassName(type: InsightMessage["type"]) {
  switch (type) {
    case "alert":
      return "asa-insight-card asa-insight-alert";

    case "question":
      return "asa-insight-card asa-insight-question";

    case "opportunity":
      return "asa-insight-card asa-insight-opportunity";

    default:
      return "asa-insight-card";
  }
}

function formatConfidence(confidence: number | undefined) {
  if (typeof confidence !== "number" || Number.isNaN(confidence)) {
    return "—";
  }

  return `${Math.round(confidence * 100)}%`;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <article className={getInsightClassName(insight.type)}>
      <div className="asa-insight-header">
        <span className="asa-insight-type">{getInsightLabel(insight.type)}</span>
      </div>

      <h3>{insight.title}</h3>

      <p>{insight.description}</p>

      <div className="asa-insight-confidence">
        Confiança: {formatConfidence(insight.confidence)}
      </div>
    </article>
  );
}