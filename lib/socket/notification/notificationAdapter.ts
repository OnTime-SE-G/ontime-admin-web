// lib/socket/notification/notificationSocketAdapter.ts

import { notificationMockSimulator } from './notificationMockSimulator';
import { notificationSocketService } from './notificationSocketService';

import type {
  NotificationSocketClient,
  Notification,
  NotificationType,
  NotificationSeverity,
} from './notificationTypes';

// ==============================
// Env resolution
// ==============================

function resolveUseMock(): boolean {
  const raw = process.env.NEXT_PUBLIC_USE_MOCK;

  if (!raw) {
    return process.env.NODE_ENV !== 'production';
  }

  const flag = raw.trim().toLowerCase();

  if (flag === 'true') return true;
  if (flag === 'false') return false;

  console.warn(
    `[NotificationSocket] Invalid NEXT_PUBLIC_USE_MOCK="${raw}" → falling back`
  );

  return process.env.NODE_ENV !== 'production';
}

const USE_MOCK = resolveUseMock();

// ==============================
// Singleton
// ==============================

let instance: NotificationSocketClient | null = null;

function createSocket(): NotificationSocketClient {
  const socket = USE_MOCK
    ? notificationMockSimulator
    : notificationSocketService;

  // Log only when actually created (not on import)
  if (typeof window !== 'undefined') {
    console.info(
      `[NotificationSocket] Mode → ${
        USE_MOCK ? '🟡 MOCK' : '🟢 REAL BACKEND'
      }`
    );
  }

  return socket;
}

// ==============================
// Public API
// ==============================

export function getNotificationSocket(): NotificationSocketClient {
  if (!instance) {
    instance = createSocket();
  }
  return instance;
}

// Optional: lazy getter (better pattern)
export const notificationSocket = new Proxy(
  {} as NotificationSocketClient,
  {
    get(_, prop) {
      const socket = getNotificationSocket();
      return socket[prop as keyof NotificationSocketClient];
    },
  }
);

// ==============================
// (Optional) Dev helper
// ==============================

export function resetNotificationSocket() {
  if (instance) {
    instance.disconnect?.();
    instance = null;
    console.warn('[NotificationSocket] Reset socket instance');
  }
}

// ==============================
// Types re-export
// ==============================

export type {
  Notification,
  NotificationType,
  NotificationSeverity,
  NotificationSocketClient,
};