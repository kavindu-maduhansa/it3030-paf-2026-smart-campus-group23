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
  private isConnecting = false;
  private shouldReconnect = true;
  private reconnectTimeout: number | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    // Don't connect if already connected or connecting
    if (this.isConnected()) {
      console.log("✅ WebSocket already connected");
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log("⏳ WebSocket connection already in progress");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.shouldReconnect = true;
        this.url = getWebSocketResourcesUrl();
        
        console.log("🔌 Connecting to WebSocket:", this.url);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected to", this.url);
          this.reconnectAttempts = 0;
          this.isConnecting = false;
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
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("⚠️ WebSocket disconnected");
          this.isConnecting = false;
          this.ws = null;
          
          if (this.shouldReconnect) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (!this.shouldReconnect) {
      console.log("🚫 Reconnection disabled");
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
      );

      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
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
    this.shouldReconnect = false;
    
    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log("🔌 WebSocket manually disconnected");
    }
  }

  /**
   * Clear all listeners (useful when component unmounts)
   */
  clearListeners(): void {
    this.listeners = [];
    console.log("🧹 All WebSocket listeners cleared");
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
  }
}

export default new WebSocketService();
