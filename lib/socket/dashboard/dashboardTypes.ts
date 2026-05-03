// ==============================
// Types
// ==============================

export type DashboardStats = {

    totalRoutes:     number;
    totalBuses:      number;
    activeBuses:     number;
    assignedDrivers: number;
  // Add these 3 lines inside DashboardStats type
    driversOnboard:     number;
    activeRoutes:       number;
    busesInMaintenance: number;
    lastUpdated:     number; // epoch ms
};

export type DisconnectReason =
  | "io server disconnect"
  | "transport close"
  | "ping timeout";

export type DashboardEventMap = {
  connect: void;
  disconnect: DisconnectReason;
  connect_error: Error;
  "dashboard:stats": DashboardStats;
};

export type DashboardEventHandler<K extends keyof DashboardEventMap> = (
  data: DashboardEventMap[K]
) => void;

// ==============================
// Socket Interface
// ==============================

export interface DashboardSocketClient {
  connect(): this;
  disconnect(): this;

  on<K extends keyof DashboardEventMap>(
    event: K,
    handler: DashboardEventHandler<K>
  ): this;

  off<K extends keyof DashboardEventMap>(
    event: K,
    handler?: DashboardEventHandler<K>
  ): this;

  once<K extends keyof DashboardEventMap>(
    event: K,
    handler: DashboardEventHandler<K>
  ): this;

  emit<K extends keyof DashboardEventMap>(
    event: K,
    data: DashboardEventMap[K]
  ): void;

  readonly isConnected: boolean;
}