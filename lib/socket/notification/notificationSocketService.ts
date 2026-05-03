import { io, Socket } from 'socket.io-client';

import type {
  NotificationSocketClient,
  NotificationEventHandler,
  NotificationEventMap,
} from './notificationTypes';

// ======================================================
// Notification Socket Service
// ======================================================

class NotificationSocketService
  implements NotificationSocketClient
{
  private socket: Socket | null = null;

  private handlers: {
    [K in keyof NotificationEventMap]?: Set<
      NotificationEventHandler<K>
    >;
  } = {};

  private _connecting = false;

  // ====================================================
  // Connect
  // ====================================================

  connect(
    url =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      'http://localhost:8000'
  ): this {
    if (this.socket?.connected || this._connecting) {
      console.log(
        '[NotificationSocket] Already connected/connecting'
      );
      return this;
    }

    this._connecting = true;

    console.log(
      `[NotificationSocket] Connecting to ${url}...`
    );

    // Cleanup old socket if exists
    this._cleanupSocket();

    this.socket = io(url, {
      transports: ['websocket', 'polling'],

      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    // ==================================================
    // Lifecycle Events
    // ==================================================

    this.socket.on('connect', () => {
      this._connecting = false;

      console.log(
        '[NotificationSocket] ✓ Connected:',
        this.socket?.id
      );

      this._emit('connect', undefined as void);

      this._attachStoredHandlers();
    });

    this.socket.on('connect_error', (error) => {
      this._connecting = false;

      console.error(
        '[NotificationSocket] Connection error:',
        error.message
      );

      this._emit('connect_error', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(
        '[NotificationSocket] Disconnected:',
        reason
      );

      this._emit('disconnect', reason as string);
    });

    return this;
  }

  // ====================================================
  // On
  // ====================================================

  on<K extends keyof NotificationEventMap>(
    event: K,
    handler: NotificationEventHandler<K>
  ): this {
    let handlerSet = this.handlers[event] as
      | Set<NotificationEventHandler<K>>
      | undefined;

    if (!handlerSet) {
      handlerSet = new Set<NotificationEventHandler<K>>();
      this.handlers[event] = handlerSet as (typeof this.handlers)[K];
    }

    // Prevent duplicates
    if (handlerSet.has(handler)) {
      return this;
    }

    handlerSet.add(handler);

    // Attach immediately if socket already exists
    if (this.socket) {
      this.socket.on(event, handler as never);
    }

    return this;
  }

  // ====================================================
  // Off
  // ====================================================

  off<K extends keyof NotificationEventMap>(
    event: K,
    handler?: NotificationEventHandler<K>
  ): this {
    const handlerSet = this.handlers[event] as
      | Set<NotificationEventHandler<K>>
      | undefined;

    if (!handlerSet) return this;

    // Remove all
    if (!handler) {
      handlerSet.forEach((h) => {
        this.socket?.off(event, h as never);
      });

      delete this.handlers[event];

      return this;
    }

    // Remove single
    handlerSet.delete(handler);

    this.socket?.off(event, handler as never);

    // Cleanup empty sets
    if (handlerSet.size === 0) {
      delete this.handlers[event];
    }

    return this;
  }

  // ====================================================
  // Once
  // ====================================================

  once<K extends keyof NotificationEventMap>(
    event: K,
    handler: NotificationEventHandler<K>
  ): this {
    const wrapper: NotificationEventHandler<K> = (
      data
    ) => {
      handler(data);
      this.off(event, wrapper);
    };

    return this.on(event, wrapper);
  }

  // ====================================================
  // Emit
  // ====================================================

  emit<K extends keyof NotificationEventMap>(
    event: K,
    data: NotificationEventMap[K]
  ): void {
    if (!this.socket?.connected) {
      console.warn(
        `[NotificationSocket] Cannot emit "${String(
          event
        )}" — socket not connected`
      );

      return;
    }

    console.log(
      `[NotificationSocket] emit "${String(event)}"`,
      data
    );

    this.socket.emit(event, data);
  }

  // ====================================================
  // Disconnect
  // ====================================================

  disconnect(): this {
    console.log(
      '[NotificationSocket] Disconnecting...'
    );

    this._connecting = false;

    this._cleanupSocket();

    return this;
  }

  // ====================================================
  // State
  // ====================================================

  get isConnected() {
    return this.socket?.connected ?? false;
  }

  // ====================================================
  // Internal Emit
  // ====================================================

  private _emit<K extends keyof NotificationEventMap>(
    event: K,
    data: NotificationEventMap[K]
  ) {
    const handlers = this.handlers[event];

    if (!handlers?.size) return;

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(
          `[NotificationSocket] Error in "${String(
            event
          )}" handler`,
          error
        );
      }
    });
  }

  // ====================================================
  // Reattach Stored Handlers
  // ====================================================

  private _attachStoredHandlers() {
    if (!this.socket) return;

    Object.entries(this.handlers).forEach(
      ([event, handlers]) => {
        handlers?.forEach((handler) => {
          this.socket?.off(event, handler as never);

          this.socket?.on(event, handler as never);
        });
      }
    );
  }

  // ====================================================
  // Cleanup
  // ====================================================

  private _cleanupSocket() {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    this.socket.disconnect();

    this.socket = null;
  }
}

// ======================================================
// Singleton Export
// ======================================================

export const notificationSocketService: NotificationSocketClient =
  new NotificationSocketService();