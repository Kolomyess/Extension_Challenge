import { useEffect, useState } from "react";

import type { CaptionMessage } from "../../shared/types/captions";
import type { InsightMessage } from "../../shared/types/insights";
import { AssistantPanel } from "./components/AssistantPanel";
import { subscribeToOverlayEvents } from "./overlayEvents";

const MAX_CAPTIONS_VISIBLE = 20;
const MAX_INSIGHTS_VISIBLE = 5;
const INSIGHT_DEDUP_WINDOW_MS = 120_000;

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

export function OverlayApp() {
  const [status, setStatus] = useState("Inicializando assistente...");
  const [captions, setCaptions] = useState<CaptionMessage[]>([]);
  const [insights, setInsights] = useState<InsightMessage[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

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
          if (wasRecentlyGenerated(current, event.payload)) {
            return current;
          }

          return [event.payload, ...current].slice(0, MAX_INSIGHTS_VISIBLE);
        });
      }
    });
  }, []);

  if (!isPanelOpen) {
    return (
      <button
        className="asa-floating-button"
        type="button"
        onClick={() => setIsPanelOpen(true)}
        aria-label="Abrir AI Sales Assistant"
        title="Abrir AI Sales Assistant"
      >
        AI
      </button>
    );
  }

  return (
    <AssistantPanel
      status={status}
      captions={captions}
      insights={insights}
      onClose={() => setIsPanelOpen(false)}
      onClearInsights={() => setInsights([])}
    />
  );
}