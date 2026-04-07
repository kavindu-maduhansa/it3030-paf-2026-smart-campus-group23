// WebSocket service for real-time resource updates
// Connects to Spring Boot WebSocket endpoint

import { getWebSocketResourcesUrl } from "../config/apiBase";

export interface ResourceEvent {
  type: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  resourceId: number;
  resourceName: string;
  resourceType: string;
  location: string;
  status: string;
  timestamp: number;
  message: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = getWebSocketResourcesUrl();
  private listeners: ((event: ResourceEvent) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.url = getWebSocketResourcesUrl();
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected to", this.url);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const resourceEvent: ResourceEvent = JSON.parse(event.data);
            console.log("📨 Resource event received:", resourceEvent);
            // Notify all listeners
            this.listeners.forEach((listener) => listener(resourceEvent));
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("⚠️ WebSocket disconnected");
          this.attemptReconnect();
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
      );

      setTimeout(() => {
        this.connect().catch(() => {
          // Continue attempting to reconnect
        });
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  /**
   * Subscribe to resource updates
   */
  subscribe(listener: (event: ResourceEvent) => void): () => void {
    this.listeners.push(listener);
    console.log(`📌 Listener added. Total listeners: ${this.listeners.length}`);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
      console.log(
        `📌 Listener removed. Total listeners: ${this.listeners.length}`
      );
    };
  }

  /**
   * Send message to server
   */
  send(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.listeners = [];
      console.log("WebSocket disconnected");
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
  }
}

export default new WebSocketService();
