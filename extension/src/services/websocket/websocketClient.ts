import type { WebSocketClientOptions } from "./websocketTypes";

export class WebSocketClient {
  private socket: WebSocket | null = null;

  constructor(private readonly options: WebSocketClientOptions) {}

  connect() {
    if (this.socket) {
      return;
    }

    this.socket = new WebSocket(this.options.url);

    this.socket.addEventListener("open", () => {
      this.options.onOpen?.();
    });

    this.socket.addEventListener("close", () => {
      this.socket = null;
      this.options.onClose?.();
    });

    this.socket.addEventListener("error", (event) => {
      this.options.onError?.(event);
    });

    this.socket.addEventListener("message", (event) => {
      try {
        this.options.onMessage?.(JSON.parse(event.data));
      } catch {
        this.options.onMessage?.(event.data);
      }
    });
  }

  send(data: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.socket.send(JSON.stringify(data));

    return true;
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}