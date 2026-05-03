// ======================================================
// Notification Categories
// ======================================================

export type NotificationType =
  | 'bus_offline'
  | 'gps_loss'
  | 'bus_delay'
  | 'driver_assigned'
  | 'driver_offline'
  | 'route_disruption'
  | 'bus_breakdown'
  | 'high_occupancy'
  | 'system_connection'
  | 'route_completed'
  | 'unauthorized_activity'
  | 'maintenance_alert';

// ======================================================
// Severity Levels
// ======================================================

export type NotificationSeverity =
  | 'info'
  | 'warning'
  | 'critical';

// ======================================================
// Notification Action (optional future support)
// ======================================================

export type NotificationAction = {
  label: string;
  action: string;
};

// ======================================================
// Notification Payload
// ======================================================

export type Notification = {
  // Core identity
  id: string;

  // Classification
  type: NotificationType;
  severity: NotificationSeverity;

  // Display
  title: string;
  message: string;

  // Related entities
  busId?: string;
  routeId?: string;
  driverId?: string;

  // Metadata
  timestamp: number;

  // UI state
  read: boolean;

  // Optional enhancements
  autoDismiss?: boolean;
  expiresAt?: number;

  // Optional source tracking
  source?: 'system' | 'backend' | 'admin';

  // Optional CTA
  action?: NotificationAction;
};

// ======================================================
// Socket Event Payloads
// ======================================================

export type NotificationNewEvent = Notification;

export type NotificationClearEvent = {
  id: string;
};

export type NotificationReadEvent = {
  id: string;
};

export type NotificationBulkClearEvent = {
  ids: string[];
};

export type NotificationSyncEvent = {
  notifications: Notification[];
};

// ======================================================
// Event Map
// ======================================================

export type NotificationEventMap = {
  // Socket lifecycle
  connect: void;
  disconnect: string;
  connect_error: Error;

  // Notification events
  'notification:new': NotificationNewEvent;

  'notification:clear': NotificationClearEvent;

  'notification:read': NotificationReadEvent;

  // Optional future scalability
  'notification:bulk_clear': NotificationBulkClearEvent;

  'notification:sync': NotificationSyncEvent;
};

// ======================================================
// Generic Event Handler
// ======================================================

export type NotificationEventHandler<
  K extends keyof NotificationEventMap
> = (
  data: NotificationEventMap[K]
) => void;

// ======================================================
// Socket Interface
// ======================================================

export interface NotificationSocketClient {
  connect(): this;

  disconnect(): this;

  on<K extends keyof NotificationEventMap>(
    event: K,
    handler: NotificationEventHandler<K>
  ): this;

  off<K extends keyof NotificationEventMap>(
    event: K,
    handler?: NotificationEventHandler<K>
  ): this;

  once<K extends keyof NotificationEventMap>(
    event: K,
    handler: NotificationEventHandler<K>
  ): this;

  emit<K extends keyof NotificationEventMap>(
    event: K,
    data: NotificationEventMap[K]
  ): void;

  readonly isConnected: boolean;
}