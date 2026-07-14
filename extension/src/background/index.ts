import { ENV } from "../config/env";
import { WebSocketClient } from "../services/websocket/websocketClient";
import type { ServerMessage } from "../services/websocket/websocketTypes";
import { logger } from "../shared/utils/logger";

let websocketClient: WebSocketClient | null = null;
let activeTeamsTabId: number | null = null;

const pendingMessages: unknown[] = [];
const tabSessionIds = new Map<number, string>();

function createSessionId() {
  if (crypto.randomUUID) {
    return `teams-${crypto.randomUUID()}`;
  }

  return `teams-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getSessionIdForTab(tabId: number) {
  const existingSessionId = tabSessionIds.get(tabId);

  if (existingSessionId) {
    return existingSessionId;
  }

  const newSessionId = createSessionId();

  tabSessionIds.set(tabId, newSessionId);

  logger.info("Nova sessão criada:", newSessionId);

  return newSessionId;
}

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
    if (sender.tab?.id) {
      getSessionIdForTab(sender.tab.id);
    }

    ensureConnection();

    sendResponse({
      ok: true
    });

    return true;
  }

  if (message?.type === "caption.received") {
    ensureConnection();

    const tabId = sender.tab?.id ?? activeTeamsTabId;

    if (!tabId) {
      sendResponse({
        ok: false,
        error: "Não foi possível identificar a aba do Teams"
      });

      return true;
    }

    const sessionId = getSessionIdForTab(tabId);

    const backendMessage = {
      type: "caption.received",
      payload: {
        sessionId,
        caption: message.payload
      }
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
      sent,
      sessionId
    });

    return true;
  }

  sendResponse({
    ok: false,
    error: "Tipo de mensagem desconhecido"
  });

  return true;
});