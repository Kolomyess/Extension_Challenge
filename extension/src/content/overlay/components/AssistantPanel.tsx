import type { CaptionMessage } from "../../../shared/types/captions";
import type { InsightMessage } from "../../../shared/types/insights";
import { InsightCard } from "./InsightCard";
import { StatusBadge } from "./StatusBadge";

interface AssistantPanelProps {
  status: string;
  captions: CaptionMessage[];
  insights: InsightMessage[];
  onClose: () => void;
  onClearInsights: () => void;
}

export function AssistantPanel({
  status,
  captions,
  insights,
  onClose,
  onClearInsights
}: AssistantPanelProps) {
  const lastCaption = captions.at(-1);

  return (
    <section className="asa-panel">
      <header className="asa-header">
        <div>
          <h2>AI Sales Assistant</h2>
          <span>Microsoft Teams</span>
        </div>

        <div className="asa-header-actions">
          <StatusBadge status={status} />

          <button
            className="asa-close-button"
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            title="Fechar painel"
          >
            ×
          </button>
        </div>
      </header>

      <div className="asa-section">
        <span className="asa-section-title">Última fala capturada</span>

        {lastCaption ? (
          <div className="asa-caption">
            <strong>{lastCaption.speaker}</strong>
            <p>{lastCaption.text}</p>
          </div>
        ) : (
          <p className="asa-muted">Aguardando legendas...</p>
        )}
      </div>

      <div className="asa-section">
        <div className="asa-section-header">
          <span className="asa-section-title">Insights em tempo real</span>

          {insights.length > 0 && (
            <button
              className="asa-clear-button"
              type="button"
              onClick={onClearInsights}
            >
              Limpar
            </button>
          )}
        </div>

        {insights.length > 0 ? (
          insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        ) : (
          <p className="asa-muted">Nenhum insight detectado ainda.</p>
        )}
      </div>
    </section>
  );
}