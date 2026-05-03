// lib/socket/dashboardSocketAdapter.ts

import { dashboardMockSimulator } from './dashboardMockSimulator';
import { dashboardSocketService } from './dashboardSocketService';
import type { DashboardSocketClient } from './dashboardTypes';

// ==============================
// Env resolution
// ==============================

function resolveUseMock(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK?.toLowerCase();

  if (flag === 'true') return true;
  if (flag === 'false') return false;

  return process.env.NODE_ENV !== 'production';
}

const USE_MOCK = resolveUseMock();

// ==============================
// Singleton instance
// ==============================

let socketInstance: DashboardSocketClient | null = null;

function createSocket(): DashboardSocketClient {
  const instance = USE_MOCK
    ? dashboardMockSimulator
    : dashboardSocketService;

  // Only log in browser (avoids SSR noise)
  if (typeof window !== 'undefined') {
    console.info(
      `[DashboardSocket] Mode → ${
        USE_MOCK ? '🟡 MOCK' : '🟢 REAL BACKEND'
      }`
    );
  }

  return instance;
}

// ==============================
// Public API
// ==============================

export function getDashboardSocket(): DashboardSocketClient {
  if (!socketInstance) {
    socketInstance = createSocket();
  }

  return socketInstance;
}

// Backward-compatible export
export const dashboardSocket = getDashboardSocket();

// ==============================
// Types re-export
// ==============================

export type {
  DashboardStats,
  DashboardSocketClient,
} from './dashboardTypes';