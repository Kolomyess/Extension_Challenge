import { createRoot } from "react-dom/client";

import type { ServerMessage } from "../services/websocket/websocketTypes";
import type { InsightMessage } from "../shared/types/insights";
import { logger } from "../shared/utils/logger";
import { meetingState } from "./captions/state";
import { startCaptionObserver } from "./captions/observer";
import { OverlayApp } from "./overlay/OverlayApp";
import { createOverlayRoot } from "./overlay/overlayRoot";
import { publishOverlayEvent } from "./overlay/overlayEvents";

import overlayStyles from "./overlay/styles.css?raw";

function mountOverlay() {
  const shadowRoot = createOverlayRoot();

  while (shadowRoot.firstChild) {
    shadowRoot.removeChild(shadowRoot.firstChild);
  }

  const style = document.createElement("style");
  style.textContent = overlayStyles;

  const appRoot = document.createElement("div");
  appRoot.id = "ai-sales-assistant-react-root";

  shadowRoot.appendChild(style);
  shadowRoot.appendChild(appRoot);

  createRoot(appRoot).render(<OverlayApp />);
}

function setupBackgroundMessageListener() {
  chrome.runtime.onMessage.addListener((message: ServerMessage) => {
    logger.info("Mensagem recebida do background:", message);

    if (message.type === "server.connected") {
      publishOverlayEvent({
        type: "status.changed",
        payload: "Servidor conectado"
      });

      return;
    }

    if (message.type === "server.status") {
      publishOverlayEvent({
        type: "status.changed",
        payload: String(message.payload)
      });

      return;
    }

    if (message.type === "insight.received") {
      publishOverlayEvent({
        type: "insight.received",
        payload: message.payload as InsightMessage
      });

      return;
    }

    if (message.type === "server.warning") {
      publishOverlayEvent({
        type: "status.changed",
        payload: "Aviso do servidor"
      });
    }
  });
}

function connectToBackend() {
  chrome.runtime.sendMessage(
    {
      type: "backend.connect"
    },
    (response) => {
      logger.info("Resposta do background ao conectar backend:", response);
    }
  );
}

function bootstrap() {
  logger.info("Content script iniciado.");

  mountOverlay();
  setupBackgroundMessageListener();
  connectToBackend();

  window.setTimeout(() => {
    startCaptionObserver({
      onStatusChange(status) {
        publishOverlayEvent({
          type: "status.changed",
          payload: status
        });
      },

      onCaption(caption) {
        meetingState.addCaption(caption);

        publishOverlayEvent({
          type: "caption.received",
          payload: caption
        });

        chrome.runtime.sendMessage(
          {
            type: "caption.received",
            payload: caption
          },
          (response) => {
            logger.info("Legenda enviada ao background:", response);
          }
        );

        logger.info("Legenda capturada:", caption);
      }
    });
  }, 500);
}

bootstrap();