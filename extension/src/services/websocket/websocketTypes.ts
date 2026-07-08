export interface WebSocketClientOptions {
  url: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  onMessage?: (data: unknown) => void;
}

export interface ServerMessage<TPayload = unknown> {
  type: string;
  payload: TPayload;
}