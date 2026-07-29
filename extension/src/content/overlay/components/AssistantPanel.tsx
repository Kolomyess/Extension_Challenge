import { useState } from "react";

import type { CaptionMessage } from "../../../shared/types/captions";
import type { InsightMessage } from "../../../shared/types/insights";
import type { AssistantSettings } from "../OverlayApp";
import { InsightCard } from "./InsightCard";
import { StatusBadge } from "./StatusBadge";

interface AssistantPanelProps {
  status: string;
  captions: CaptionMessage[];
  insights: InsightMessage[];
  settings: AssistantSettings;
  onClose: () => void;
  onClearInsights: () => void;
  onSettingsChange: (settings: Partial<AssistantSettings>) => void;
}

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="asa-toggle-row">
      <span>
        <strong>{label}</strong>

        {description && <small>{description}</small>}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />

      <span className="asa-toggle-track" aria-hidden="true">
        <span className="asa-toggle-thumb" />
      </span>
    </label>
  );
}

export function AssistantPanel({
  status,
  captions,
  insights,
  settings,
  onClose,
  onClearInsights,
  onSettingsChange
}: AssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "settings">("insights");

  const lastCaption = captions.at(-1);

  return (
    <aside className="asa-panel">
      <header className="asa-header">
        <div className="asa-brand">
          <div className="asa-logo">SA</div>

          <div>
            <span className="asa-kicker">Suporte comercial</span>
            <h2>Painel da Reunião</h2>
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

      <div className="asa-master-control">
        <div>
          <strong>
            {settings.suggestionsEnabled
              ? "Sugestões ativadas"
              : "Sugestões desativadas"}
          </strong>
          <span>Controle as recomendações exibidas durante a reunião.</span>
        </div>

        <button
          className={`asa-master-switch ${
            settings.suggestionsEnabled ? "asa-master-switch-on" : ""
          }`}
          type="button"
          onClick={() =>
            onSettingsChange({
              suggestionsEnabled: !settings.suggestionsEnabled
            })
          }
          aria-label="Ativar ou desativar sugestões"
        >
          <span />
        </button>
      </div>

      <nav className="asa-tabs">
        <button
          className={activeTab === "insights" ? "asa-tab-active" : ""}
          type="button"
          onClick={() => setActiveTab("insights")}
        >
          Insights
        </button>

        <button
          className={activeTab === "settings" ? "asa-tab-active" : ""}
          type="button"
          onClick={() => setActiveTab("settings")}
        >
          Configurações
        </button>
      </nav>

      <main className="asa-panel-body">
        {activeTab === "insights" ? (
          <>
            <section className="asa-section asa-live-card">
              <div className="asa-section-header">
                <div>
                  <span className="asa-section-title">Última fala capturada</span>
                  <p className="asa-section-subtitle">
                    Legenda ao vivo da reunião
                  </p>
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
          </>
        ) : (
          <section className="asa-section asa-settings-section">
            <div className="asa-settings-title">
              <span>Configurações</span>
              <p>Personalize como o painel recomenda ações durante a reunião.</p>
            </div>

            <div className="asa-settings-group">
              <ToggleRow
                label="Sugerir perguntas simples"
                description="Perguntas rápidas para continuar a conversa."
                checked={settings.simpleQuestionsEnabled}
                onChange={(checked) =>
                  onSettingsChange({ simpleQuestionsEnabled: checked })
                }
              />

              <ToggleRow
                label="Sugerir oportunidades"
                description="Sinais de venda, aderência ou melhoria operacional."
                checked={settings.opportunitiesEnabled}
                onChange={(checked) =>
                  onSettingsChange({ opportunitiesEnabled: checked })
                }
              />

              <ToggleRow
                label="Sugerir perguntas críticas"
                description="Perguntas para objeções, riscos e decisão."
                checked={settings.criticalQuestionsEnabled}
                onChange={(checked) =>
                  onSettingsChange({ criticalQuestionsEnabled: checked })
                }
              />
            </div>

            <div className="asa-instructions-field">
              <label htmlFor="asa-custom-instructions">
                Instruções para as recomendações
              </label>

              <textarea
                id="asa-custom-instructions"
                value={settings.customInstructions}
                onChange={(event) =>
                  onSettingsChange({ customInstructions: event.target.value })
                }
                placeholder="Ex: priorize perguntas sobre orçamento, prazo de decisão e impacto financeiro."
              />
            </div>
          </section>
        )}
      </main>
    </aside>
  );
}