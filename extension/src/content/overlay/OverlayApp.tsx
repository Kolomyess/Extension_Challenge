import { useState } from "react";

import type { CaptionMessage } from "../../shared/types/captions";
import type { InsightMessage } from "../../shared/types/insights";
import { AssistantPanel } from "./components/AssistantPanel";
import { subscribeToOverlayEvents } from "./overlayEvents";
import { applyTeamsPageOffset, clearTeamsPageOffset } from "./pageLayout";
import { useEffect } from "react";

const MAX_CAPTIONS_VISIBLE = 20;
const MAX_INSIGHTS_VISIBLE = 5;
const INSIGHT_DEDUP_WINDOW_MS = 120_000;
const SETTINGS_STORAGE_KEY = "asa-assistant-settings-v1";

export interface AssistantSettings {
  suggestionsEnabled: boolean;
  simpleQuestionsEnabled: boolean;
  opportunitiesEnabled: boolean;
  criticalQuestionsEnabled: boolean;
  customInstructions: string;
}

const DEFAULT_SETTINGS: AssistantSettings = {
  suggestionsEnabled: true,
  simpleQuestionsEnabled: true,
  opportunitiesEnabled: true,
  criticalQuestionsEnabled: true,
  customInstructions: ""
};

function loadSettings(): AssistantSettings {
  try {
    const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(rawSettings)
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AssistantSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function getInsightKey(insight: InsightMessage) {
  return `${insight.type}:${insight.title}`;
}

function wasRecentlyGenerated(current: InsightMessage[], incoming: InsightMessage) {
  const incomingTime = Date.parse(incoming.createdAt);

  return current.some((existingInsight) => {
    const sameInsight = getInsightKey(existingInsight) === getInsightKey(incoming);

    if (!sameInsight) {
      return false;
    }

    const existingTime = Date.parse(existingInsight.createdAt);

    if (Number.isNaN(existingTime) || Number.isNaN(incomingTime)) {
      return true;
    }

    return Math.abs(incomingTime - existingTime) <= INSIGHT_DEDUP_WINDOW_MS;
  });
}

function shouldShowInsight(insight: InsightMessage, settings: AssistantSettings) {
  if (!settings.suggestionsEnabled) {
    return false;
  }

  if (insight.type === "opportunity" && !settings.opportunitiesEnabled) {
    return false;
  }

  if (
    insight.type === "question" &&
    !settings.simpleQuestionsEnabled &&
    !settings.criticalQuestionsEnabled
  ) {
    return false;
  }

  return true;
}

export function OverlayApp() {
  const [status, setStatus] = useState("Inicializando assistente...");
  const [captions, setCaptions] = useState<CaptionMessage[]>([]);
  const [insights, setInsights] = useState<InsightMessage[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [settings, setSettings] = useState<AssistantSettings>(() => loadSettings());

  function updateSettings(partialSettings: Partial<AssistantSettings>) {
    setSettings((currentSettings) => {
      const nextSettings = {
        ...currentSettings,
        ...partialSettings
      };

      saveSettings(nextSettings);

      return nextSettings;
    });
  }

  useEffect(() => {
    return subscribeToOverlayEvents((event) => {
      if (event.type === "status.changed") {
        setStatus(event.payload);
      }

      if (event.type === "caption.received") {
        setCaptions((current) =>
          [...current, event.payload].slice(-MAX_CAPTIONS_VISIBLE)
        );
      }

      if (event.type === "insight.received") {
        setInsights((current) => {
          if (!shouldShowInsight(event.payload, settings)) {
            return current;
          }

          if (wasRecentlyGenerated(current, event.payload)) {
            return current;
          }

          return [event.payload, ...current].slice(0, MAX_INSIGHTS_VISIBLE);
        });
      }
    });
  }, [settings]);

  useEffect(() => {
    if (isPanelOpen) {
      applyTeamsPageOffset();
    } else {
      clearTeamsPageOffset();
    }

    return () => {
      clearTeamsPageOffset();
    };
  }, [isPanelOpen]);

  if (!isPanelOpen) {
    return (
      <button
        className="asa-floating-button"
        type="button"
        onClick={() => setIsPanelOpen(true)}
        aria-label="Abrir painel comercial"
        title="Abrir painel comercial"
      >
        <span className="asa-floating-icon">SA</span>
        <span className="asa-floating-label">Abrir painel</span>
      </button>
    );
  }

  return (
    <AssistantPanel
      status={status}
      captions={captions}
      insights={insights}
      settings={settings}
      onSettingsChange={updateSettings}
      onClose={() => setIsPanelOpen(false)}
      onClearInsights={() => setInsights([])}
    />
  );
}