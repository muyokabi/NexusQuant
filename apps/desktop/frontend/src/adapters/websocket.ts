export interface WebSocketMessage {
  type: string;
  channel: string;
  data: any;
}

export class LiveWebSocketAdapter {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Set<(msg: WebSocketMessage) => void> = new Set();
  private reconnectTimeout: any = null;

  constructor(url: string = "ws://localhost:8080/feed") {
    this.url = url;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onmessage = (event) => {
        try {
          const parsed: WebSocketMessage = JSON.parse(event.data);
          this.listeners.forEach(cb => cb(parsed));
        } catch (e) {
          // Ignore parse errors from system heartbeat ping-pongs
        }
      };

      this.ws.onclose = () => {
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  subscribe(channel: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: "subscribe", channel }));
    }
  }

  unsubscribe(channel: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: "unsubscribe", channel }));
    }
  }

  onMessage(callback: (msg: WebSocketMessage) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}

export const liveSocket = new LiveWebSocketAdapter();
