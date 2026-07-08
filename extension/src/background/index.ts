import { ENV } from "../config/env";
import { WebSocketClient } from "../services/websocket/websocketClient";
import type { ServerMessage } from "../services/websocket/websocketTypes";
import { logger } from "../shared/utils/logger";

let websocketClient: WebSocketClient | null = null;
let activeTeamsTabId: number | null = null;

const pendingMessages: unknown[] = [];

function sendToContentScript(message: unknown) {
  if (!activeTeamsTabId) {
    logger.warn("Nenhuma aba do Teams registrada para receber mensagens.");
    return;
  }

  chrome.tabs.sendMessage(activeTeamsTabId, message, () => {
    if (chrome.runtime.lastError) {
      logger.warn(
        "Não foi possível enviar mensagem ao content script:",
        chrome.runtime.lastError.message
      );
    }
  });
}

function createConnection() {
  websocketClient = new WebSocketClient({
    url: ENV.websocketUrl,

    onOpen() {
      logger.info("WebSocket conectado ao backend.");

      sendToContentScript({
        type: "server.status",
        payload: "Servidor conectado"
      });

      while (pendingMessages.length > 0) {
        const message = pendingMessages.shift();
        websocketClient?.send(message);
      }
    },

    onClose() {
      logger.warn("WebSocket desconectado do backend.");
      websocketClient = null;

      sendToContentScript({
        type: "server.status",
        payload: "Servidor desconectado"
      });
    },

    onError(event) {
      logger.error("Erro no WebSocket:", event);

      sendToContentScript({
        type: "server.status",
        payload: "Erro ao conectar servidor"
      });
    },

    onMessage(data) {
      const message = data as ServerMessage;

      logger.info("Mensagem recebida do backend:", message);

      sendToContentScript(message);
    }
  });

  websocketClient.connect();
}

function ensureConnection() {
  if (websocketClient?.isConnected()) {
    return;
  }

  if (!websocketClient) {
    createConnection();
  }
}

chrome.runtime.onInstalled.addListener(() => {
  logger.info("Extensão instalada.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.tab?.id) {
    activeTeamsTabId = sender.tab.id;
  }

  if (message?.type === "backend.connect") {
    ensureConnection();

    sendResponse({
      ok: true
    });

    return true;
  }

  if (message?.type === "caption.received") {
    ensureConnection();

    const backendMessage = {
      type: "caption.received",
      payload: message.payload
    };

    const sent = websocketClient?.send(backendMessage) ?? false;

    if (!sent) {
      pendingMessages.push(backendMessage);

      sendToContentScript({
        type: "server.status",
        payload: "Conectando ao servidor..."
      });
    }

    sendResponse({
      ok: true,
      sent
    });

    return true;
  }

  sendResponse({
    ok: false,
    error: "Tipo de mensagem desconhecido"
  });

  return true;
});