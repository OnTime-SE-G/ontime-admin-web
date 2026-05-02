import { io, Socket } from 'socket.io-client';
import type {
  SocketClient,
  SocketEventHandler,
  SocketEventMap,
} from './socketTypes';

export type BusLocation = {
  busId: string;
  routeId: string;
  lat: number;
  lng: number;
  speed: number;         // km/h
  heading: number;       // 0–360 degrees
  timestamp: number;     // epoch ms
  occupancy: 'low' | 'medium' | 'high';
  status: 'active' | 'delayed';   // ← add
  driverName: string;              // ← add
  eta: number;              // minutes until next stop ← add
};

/**
 * Singleton WebSocket service used across the app
 * Ensures only one active socket connection exists
 */
class SocketService {
  private socket: Socket | null = null;

  /**
   * Establish connection to the socket server
   * Uses environment URL with safe fallback
   */
  connect(
    url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000'
  ) {
    // Prevent duplicate connections
    if (this.socket?.connected) return;

    this.socket = io(url, {
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    // Connection established
    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    // Connection error
    this.socket.on('connect_error', (e) => {
      console.error('[Socket] Error:', e.message);
    });

    // Disconnected
    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    // Reconnection success (NEW improvement)
    this.socket.on('reconnect', (attempt) => {
      console.log('[Socket] Reconnected after', attempt, 'attempt(s)');
    });
  }

  /**
   * Listen to an event from the server
   * Added null safety check to avoid silent failures
   */
  on<K extends keyof SocketEventMap>(
    event: K,
    cb: SocketEventHandler<K>
  ) {
    if (!this.socket) {
      console.warn(`[Socket] Cannot listen to "${event}" - socket not initialized`);
      return;
    }
    this.socket.on(event, cb as never);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof SocketEventMap>(
    event: K,
    cb?: SocketEventHandler<K>
  ) {
    if (!this.socket) return;
    this.socket.off(event, cb as never);
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: unknown) {
    if (!this.socket) {
      console.warn(`[Socket] Cannot emit "${event}" - socket not initialized`);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Disconnect socket and clean up all listeners
   * Prevents memory leaks
   */
  disconnect() {
    if (!this.socket) return;

    this.socket.removeAllListeners(); // 🔥 important cleanup
    this.socket.disconnect();
    this.socket = null;
  }

  /**
   * Check connection status
   */
  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

// Export singleton instance
export const socketService: SocketClient = new SocketService();