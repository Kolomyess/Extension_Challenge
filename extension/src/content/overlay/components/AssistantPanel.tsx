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
    <aside className="asa-panel">
      <header className="asa-header">
        <div className="asa-brand">
          <div className="asa-logo">AI</div>

          <div>
            <span className="asa-kicker">Meeting copilot</span>
            <h2>Sales Assistant</h2>
          </div>
        </div>

        <button
          className="asa-close-button"
          type="button"
          onClick={onClose}
          aria-label="Fechar painel"
          title="Fechar painel"
        >
          ×
        </button>
      </header>

      <div className="asa-status-row">
        <StatusBadge status={status} />
        <span className="asa-network-pill">Microsoft Teams</span>
      </div>

      <main className="asa-panel-body">
        <section className="asa-section asa-live-card">
          <div className="asa-section-header">
            <div>
              <span className="asa-section-title">Última fala capturada</span>
              <p className="asa-section-subtitle">Legenda ao vivo da reunião</p>
            </div>
          </div>

          {lastCaption ? (
            <div className="asa-caption">
              <strong>{lastCaption.speaker}</strong>
              <p>{lastCaption.text}</p>
            </div>
          ) : (
            <p className="asa-muted">Aguardando legendas do Teams...</p>
          )}
        </section>

        <section className="asa-section">
          <div className="asa-section-header">
            <div>
              <span className="asa-section-title">Insights em tempo real</span>
              <p className="asa-section-subtitle">
                Alertas, oportunidades e perguntas sugeridas
              </p>
            </div>

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

          <div className="asa-insights-list">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))
            ) : (
              <div className="asa-empty-state">
                <span>●</span>
                <p>Nenhum insight detectado ainda.</p>
              </div>
            )}
          </div>
          
        </section>
      </main>
    </aside>
  );
}