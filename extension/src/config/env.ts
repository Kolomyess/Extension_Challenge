export const ENV = {
  websocketUrl: import.meta.env.VITE_WEBSOCKET_URL ?? "ws://127.0.0.1:8000/ws"
} as const;