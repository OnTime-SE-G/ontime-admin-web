// lib/socket/dashboardSocketService.ts

import { io, Socket } from 'socket.io-client';
import type {
  DashboardSocketClient,
  DashboardEventHandler,
  DashboardEventMap,
} from './dashboardTypes';

// ==============================
// Service
// ==============================

class DashboardSocketService implements DashboardSocketClient {
  private socket: Socket | null = null;

  private handlers: {
    [K in keyof DashboardEventMap]?: Set<DashboardEventHandler<K>>;
  } = {};

  // ==============================
  // Connect
  // ==============================

  connect(
    url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000'
  ): this {
    if (this.socket?.connected) return this;

    console.log(`[DashboardSocket] Connecting to ${url}...`);

    // Cleanup old socket (important)
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    // Core events
    this.socket.on('connect', () => {
      console.log('[DashboardSocket] ✓ Connected:', this.socket?.id);
      this._emit('connect', undefined);
    });

    this.socket.on('connect_error', (e) => {
      console.error('[DashboardSocket] Connection error:', e.message);
      this._emit('connect_error', e);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[DashboardSocket] Disconnected:', reason);
      this._emit('disconnect', reason as DashboardEventMap['disconnect']);
    });

    // Reattach stored handlers
    this._attachHandlers();

    return this;
  }

  // ==============================
  // Events
  // ==============================

  on<K extends keyof DashboardEventMap>(
    event: K,
    handler: DashboardEventHandler<K>
  ): this {
    let eventHandlers = this.handlers[event] as Set<DashboardEventHandler<K>> | undefined;
    if (!eventHandlers) {
      eventHandlers = new Set<DashboardEventHandler<K>>();
      this.handlers[event] = eventHandlers as (typeof this.handlers)[K];
    }

    eventHandlers.add(handler);

    // Attach immediately if socket exists
    if (this.socket) {
      this.socket.on(event, handler as any);
    }

    return this;
  }

  off<K extends keyof DashboardEventMap>(
    event: K,
    handler?: DashboardEventHandler<K>
  ): this {
    if (!this.handlers[event]) return this;

    if (!handler) {
      this.handlers[event]?.forEach((h) => {
        this.socket?.off(event, h as any);
      });
      delete this.handlers[event];
    } else {
      this.handlers[event]!.delete(handler);
      this.socket?.off(event, handler as any);
    }

    return this;
  }

  once<K extends keyof DashboardEventMap>(
    event: K,
    handler: DashboardEventHandler<K>
  ): this {
    const wrapper: DashboardEventHandler<K> = (data) => {
      handler(data);
      this.off(event, wrapper);
    };

    this.on(event, wrapper);
    return this;
  }

  emit<K extends keyof DashboardEventMap>(
    event: K,
    data: DashboardEventMap[K]
  ): void {
    if (!this.socket) {
      console.warn(`[DashboardSocket] Cannot emit "${String(event)}" — no socket`);
      return;
    }

    console.log(`[DashboardSocket] emit "${String(event)}"`, data);
    this.socket.emit(event, data);
  }

  // ==============================
  // Disconnect
  // ==============================

  disconnect(): this {
    if (!this.socket) return this;

    console.log('[DashboardSocket] Disconnecting...');

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;

    return this;
  }

  // ==============================
  // Internal
  // ==============================

  private _emit<K extends keyof DashboardEventMap>(
    event: K,
    data: DashboardEventMap[K]
  ) {
    this.handlers[event]?.forEach((handler) => handler(data));
  }

  private _attachHandlers() {
    if (!this.socket) return;

    Object.entries(this.handlers).forEach(([event, handlers]) => {
      handlers?.forEach((handler) => {
        this.socket!.on(event, handler as any);
      });
    });
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

// ==============================
// Singleton
// ==============================

export const dashboardSocketService: DashboardSocketClient =
  new DashboardSocketService();