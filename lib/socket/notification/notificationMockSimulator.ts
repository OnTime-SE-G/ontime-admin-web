// ======================================================
// Notification Mock Simulator
// ======================================================

import type {
  Notification,
  NotificationSocketClient,
  NotificationEventHandler,
  NotificationEventMap,
} from './notificationTypes';

// ======================================================
// Mock Templates
// ======================================================

const MOCK_NOTIFICATIONS: ReadonlyArray<
  Omit<Notification, 'id' | 'timestamp' | 'read'>
> = [
  {
    type: 'bus_offline',
    severity: 'critical',
    title: 'Bus went offline',
    message: '⚠ Bus B12 went offline',
    busId: 'B12',
    autoDismiss: false,
  },

  {
    type: 'gps_loss',
    severity: 'warning',
    title: 'GPS signal lost',
    message: '📍 GPS signal lost for Bus B5',
    busId: 'B5',
  },

  {
    type: 'bus_delay',
    severity: 'warning',
    title: 'Bus delayed',
    message: '⏰ Bus B8 delayed by 12 minutes',
    busId: 'B8',
    routeId: 'R138',
  },

  {
    type: 'driver_assigned',
    severity: 'info',
    title: 'Driver assignment changed',
    message: '👨‍✈️ New driver assigned to Bus B2',
    busId: 'B2',
    driverId: 'D04',
    autoDismiss: true,
  },

  {
    type: 'driver_offline',
    severity: 'warning',
    title: 'Driver disconnected',
    message: '🚫 Driver disconnected from Bus B10',
    busId: 'B10',
  },

  {
    type: 'route_disruption',
    severity: 'critical',
    title: 'Route disruption',
    message: '🛑 Route 138 temporarily blocked',
    routeId: 'R138',
    autoDismiss: false,
  },

  {
    type: 'bus_breakdown',
    severity: 'critical',
    title: 'Bus breakdown reported',
    message: '🔴 Bus B6 reported breakdown',
    busId: 'B6',
    autoDismiss: false,
  },

  {
    type: 'high_occupancy',
    severity: 'warning',
    title: 'High occupancy alert',
    message: '👥 Bus B4 occupancy reached 90%',
    busId: 'B4',
  },

  {
    type: 'system_connection',
    severity: 'critical',
    title: 'System connection issue',
    message: '🌐 WebSocket connection lost',
    autoDismiss: false,
  },

  {
    type: 'route_completed',
    severity: 'info',
    title: 'Route completed',
    message: '✅ Bus B7 completed route successfully',
    busId: 'B7',
    routeId: 'R154',
    autoDismiss: true,
  },

  {
    type: 'unauthorized_activity',
    severity: 'critical',
    title: 'Unauthorized activity',
    message: '🔒 Unauthorized login attempt detected',
    autoDismiss: false,
  },

  {
    type: 'maintenance_alert',
    severity: 'info',
    title: 'Maintenance scheduled',
    message: '🛠 Bus B3 scheduled for maintenance',
    busId: 'B3',
  },
];

// ======================================================
// Utilities
// ======================================================

function generateId(): string {
  return `notif_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function pickRandomTemplate() {
  return MOCK_NOTIFICATIONS[
    Math.floor(Math.random() * MOCK_NOTIFICATIONS.length)
  ];
}

function randomInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ======================================================
// Simulator
// ======================================================

class NotificationMockSimulator
  implements NotificationSocketClient
{
  private handlers: {
    [K in keyof NotificationEventMap]?: Set<
      NotificationEventHandler<K>
    >;
  } = {};

  private notificationInterval:
    | ReturnType<typeof setInterval>
    | null = null;

  private connectionTimeout:
    | ReturnType<typeof setTimeout>
    | null = null;

  private _connected = false;
  private _connecting = false;

  // ====================================================
  // Connection
  // ====================================================

  connect(): this {
    if (this._connected || this._connecting) {
      console.log(
        '[NotificationMock] Already connected/connecting'
      );
      return this;
    }

    this._connecting = true;

    console.log('[NotificationMock] Connecting...');

    this.connectionTimeout = setTimeout(() => {
      this._connecting = false;
      this._connected = true;

      console.log('[NotificationMock] ✓ Connected');

      this._emit('connect', undefined as void);

      this._startSimulation();
    }, 400);

    return this;
  }

  disconnect(): this {
    console.log('[NotificationMock] Disconnecting...');

    this._cleanup();

    this._connected = false;
    this._connecting = false;

    this._emit('disconnect', 'io client disconnect');

    return this;
  }

  // ====================================================
  // Event Registration
  // ====================================================

  on<K extends keyof NotificationEventMap>(
    event: K,
    handler: NotificationEventHandler<K>
  ): this {
    let eventHandlers = this.handlers[event] as
      | Set<NotificationEventHandler<K>>
      | undefined;

    if (!eventHandlers) {
      eventHandlers = new Set<NotificationEventHandler<K>>();
      this.handlers[event] = eventHandlers as (typeof this.handlers)[K];
    }

    eventHandlers.add(handler);

    return this;
  }

  off<K extends keyof NotificationEventMap>(
    event: K,
    handler?: NotificationEventHandler<K>
  ): this {
    if (!this.handlers[event]) return this;

    if (!handler) {
      delete this.handlers[event];
      return this;
    }

    const eventHandlers = this.handlers[event] as
      | Set<NotificationEventHandler<K>>
      | undefined;

    eventHandlers?.delete(handler);

    return this;
  }

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
    console.log(
      `[NotificationMock] emit "${String(event)}"`,
      data
    );
  }

  // ====================================================
  // State
  // ====================================================

  get isConnected() {
    return this._connected;
  }

  // ====================================================
  // Simulation
  // ====================================================

  private _startSimulation() {
    this._cleanupSimulation();

    console.log(
      '[NotificationMock] Simulation started'
    );

    // Immediate push
    this._pushNotification();

    // Continuous stream
    this.notificationInterval = setInterval(() => {
      this._pushNotification();
    }, randomInterval(5000, 9000));
  }

  private _pushNotification() {
    if (!this._connected) return;

    const template = pickRandomTemplate();

    const notification: Notification = {
      ...template,
      id: generateId(),
      timestamp: Date.now(),
      read: false,
    };

    console.log(
      '[NotificationMock] notification:new',
      {
        type: notification.type,
        severity: notification.severity,
      }
    );

    this._emit('notification:new', notification);

    // Optional auto clear simulation
    if (notification.autoDismiss) {
      setTimeout(() => {
        this._emit('notification:clear', {
          id: notification.id,
        });
      }, 8000);
    }
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
          `[NotificationMock] Error in "${String(
            event
          )}" handler`,
          error
        );
      }
    });
  }

  // ====================================================
  // Cleanup
  // ====================================================

  private _cleanupSimulation() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }

  private _cleanup() {
    this._cleanupSimulation();

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }
}

// ======================================================
// Singleton Export
// ======================================================

export const notificationMockSimulator: NotificationSocketClient =
  new NotificationMockSimulator();