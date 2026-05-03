// lib/socket/dashboardMockSimulator.ts

import type {
  DisconnectReason,
  DashboardStats,
  DashboardSocketClient,
  DashboardEventHandler,
  DashboardEventMap,
} from './dashboardTypes';

// ==============================
// Seed Data
// ==============================

const INITIAL_STATS: DashboardStats = {
  totalRoutes:     21,
  totalBuses:      48,
  activeBuses:     32,
  assignedDrivers: 44,
  lastUpdated:     Date.now(),
};

// ==============================
// Helpers
// ==============================

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function drift(magnitude: number): number {
  if (Math.random() < 0.4) return 0;
  return Math.random() < 0.5 ? magnitude : -magnitude;
}

function clone<T>(obj: T): T {
  if (typeof structuredClone === "function") return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

// ==============================
// Simulator
// ==============================

class DashboardMockSimulator implements DashboardSocketClient {
  private handlers: {
    [K in keyof DashboardEventMap]?: Set<DashboardEventHandler<K>>;
  } = {};

  private stats: DashboardStats = clone(INITIAL_STATS);

  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private connectTimeout: ReturnType<typeof setTimeout> | null = null;

  private _connected  = false;
  private _connecting = false;

  // ==============================
  // Public API
  // ==============================

  connect(): this {
    if (this._connected || this._connecting) {
      console.log('[DashboardMock] Already connected or connecting');
      return this;
    }

    this._connecting = true;
    console.log('[DashboardMock] Connecting...');

    if (this.connectTimeout) clearTimeout(this.connectTimeout);

    this.connectTimeout = setTimeout(() => {
      this._connecting = false;
      this._connected  = true;

      console.log('[DashboardMock] ✓ Connected');
      this._emit('connect', undefined);

      this._startSimulation();
    }, 350);

    return this;
  }

  disconnect(): this {
    console.log('[DashboardMock] Disconnecting...');

    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    this._connected  = false;
    this._connecting = false;

    const reason: DisconnectReason = 'io server disconnect';
    this._emit('disconnect', reason);

    return this;
  }

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
    return this;
  }

  off<K extends keyof DashboardEventMap>(
    event: K,
    handler?: DashboardEventHandler<K>
  ): this {
    if (!this.handlers[event]) return this;

    if (!handler) {
      delete this.handlers[event];
    } else {
      this.handlers[event]!.delete(handler);
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
    console.log(`[DashboardMock] emit "${String(event)}"`, data);
  }

  get isConnected() {
    return this._connected;
  }

  // ==============================
  // Simulation
  // ==============================

  private _startSimulation() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    console.log('[DashboardMock] Stats simulation started (4s interval)');

    this._pushStats();

    this.statsInterval = setInterval(() => {
      this.stats = {
        totalRoutes:     clamp(this.stats.totalRoutes     + drift(1), 18, 25),
        totalBuses:      clamp(this.stats.totalBuses      + drift(2), 40, 60),
        activeBuses:     clamp(this.stats.activeBuses     + drift(3), 20, 40),
        assignedDrivers: clamp(this.stats.assignedDrivers + drift(2), 30, 55),
        lastUpdated:     Date.now(),
      };

      this._pushStats();
    }, 4000);
  }

  private _pushStats() {
    console.log('[DashboardMock] dashboard:stats →', {
      ...this.stats,
      lastUpdated: new Date(this.stats.lastUpdated).toLocaleTimeString(),
    });

    this._emit('dashboard:stats', this.stats);
  }

  private _emit<K extends keyof DashboardEventMap>(
    event: K,
    data: DashboardEventMap[K]
  ) {
    this.handlers[event]?.forEach((handler) => handler(data));
  }
}

// ==============================
// Singleton
// ==============================

export const dashboardMockSimulator: DashboardSocketClient =
  new DashboardMockSimulator();