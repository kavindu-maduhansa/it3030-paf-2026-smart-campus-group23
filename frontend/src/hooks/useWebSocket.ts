import { useEffect, useRef } from 'react';
import webSocketService from '../services/webSocketService';
import type { ResourceEvent } from '../services/webSocketService';

/**
 * Custom hook for managing WebSocket connection
 * Ensures single connection and proper cleanup
 */
export function useWebSocket(
  onEvent: (event: ResourceEvent) => void,
  enabled: boolean = true
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Connect to WebSocket if not already connected
    if (!hasConnectedRef.current && !webSocketService.isConnected()) {
      hasConnectedRef.current = true;
      
      webSocketService.connect()
        .then(() => {
          console.log('[useWebSocket] Connected successfully');
          // Subscribe to events
          unsubscribeRef.current = webSocketService.subscribe(onEvent);
        })
        .catch((err) => {
          console.error('[useWebSocket] Connection failed:', err);
          hasConnectedRef.current = false;
        });
    } else if (webSocketService.isConnected()) {
      // Already connected, just subscribe
      console.log('[useWebSocket] Using existing connection');
      unsubscribeRef.current = webSocketService.subscribe(onEvent);
    }

    // Cleanup: unsubscribe but don't disconnect (shared connection)
    return () => {
      console.log('[useWebSocket] Cleaning up subscription');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [enabled, onEvent]);

  return {
    isConnected: webSocketService.isConnected(),
  };
}
