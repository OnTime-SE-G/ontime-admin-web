"use client";

import { create } from "zustand";
import type { Bus, BusStatus, Driver, PlannedTrip, Schedule, TransitRoute } from "@/lib/types";
import {
  fetchRoutes,
  fetchAllAdminBuses,
  fetchLiveBuses,
  createBus,
  updateBus,
  deleteBusApi,
  deleteRouteApi,
  fetchDrivers,
  createDriver,
  deleteDriverApi,
  fetchSchedules,
  createSchedule as createScheduleApi,
  fetchTodayTrips,
  generateTrips,
  assignTripResources,
  overrideTripDelay,
  logTripIncident,
  assignBusToRoute as assignBusToRouteApi,
  unassignBus as unassignBusApi,
  type ApiRoute,
  type ApiAdminBus,
  type ApiLiveBus,
  type ApiDriver,
  type ApiSchedule,
  type ApiPlannedTrip,
} from "@/lib/api";

type NewBus = Omit<Bus, "id">;

type AdminStore = {
  routes: TransitRoute[];
  buses: Bus[];
  drivers: Driver[];
  schedules: Schedule[];
  plannedTrips: PlannedTrip[];
  isLoading: boolean;

  loadRoutes: () => Promise<void>;
  loadBuses: () => Promise<void>;
  loadDrivers: () => Promise<void>;
  loadSchedules: () => Promise<void>;
  loadTodayTrips: (targetDate?: string) => Promise<void>;

  deleteRoute: (id: string) => Promise<void>;

  addBus: (payload: NewBus) => Promise<void>;
  updateBusStatus: (id: string, status: BusStatus) => Promise<void>;
  deleteBus: (id: string) => Promise<void>;

  addDriver: (data: { name: string; license_number: string; phone?: string }) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  assignBusToRoute: (busId: string, routeId: string) => Promise<void>;
  unassignBus: (busId: string) => Promise<void>;
  addSchedule: (data: { route_id: number; scheduled_time: string; day_of_week: number }) => Promise<void>;
  generateTodayTrips: () => Promise<void>;
  assignTrip: (tripId: string, busId: number, driverId: number) => Promise<void>;
  overrideDelay: (tripId: string, delayMinutes: number) => Promise<void>;
  logIncident: (tripId: string, incidentType: string, description?: string) => Promise<void>;
  updateBusFull: (id: string, data: { fleet_code?: string; plate_number?: string; capacity?: number; status?: string }) => Promise<void>;
};

function mapApiRoute(r: ApiRoute): TransitRoute {
  const parts = r.name.split(" - ");
  return {
    id: String(r.id),
    routeNumber: r.route_number ?? String(r.id),
    startStation: parts[0]?.trim() ?? r.name,
    endStation: parts[1]?.trim() ?? "",
    stops: [],
    status: "Active",
  };
}

function mapApiBus(b: ApiAdminBus | ApiLiveBus): Bus {
  return {
    id: b.id,
    busNumber: (b as ApiAdminBus).plate_number || b.id,
    busType: b.fleet_code || "Standard",
    status: ["active", "Active", "ACTIVE"].includes(b.status) ? "Active" : "Maintenance",
    seatCapacity: (b as ApiAdminBus).capacity ?? 0,
    routeId: (b as ApiAdminBus).route_id ?? null,
  };
}

function mapApiDriver(d: ApiDriver): Driver {
  return {
    id: String(d.id),
    name: d.name,
    licenseNumber: d.license_number,
    phone: d.phone ?? "",
  };
}

function mapApiSchedule(s: ApiSchedule): Schedule {
  return {
    id: String(s.id),
    routeId: s.route_id,
    scheduledTime: s.scheduled_time,
    dayOfWeek: s.day_of_week,
  };
}

function mapApiTrip(t: ApiPlannedTrip): PlannedTrip {
  return {
    id: t.id,
    scheduleId: t.schedule_id,
    busId: t.bus_id,
    driverId: t.driver_id,
    date: t.date,
    status: t.status,
    delayMinutes: t.delay_minutes,
    lastIncidentType: t.last_incident_type,
  };
}

export const useAdminStore = create<AdminStore>((set) => ({
  routes: [],
  buses: [],
  drivers: [],
  schedules: [],
  plannedTrips: [],
  isLoading: false,

  loadRoutes: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchRoutes();
      set({ routes: data.map(mapApiRoute), isLoading: false });
    } catch (e) {
      console.error("[AdminStore] loadRoutes failed:", e);
      set({ isLoading: false });
    }
  },

  loadBuses: async () => {
    set({ isLoading: true });
    try {
      // Try the admin endpoint first (has capacity); fall back to live buses if it fails
      let data;
      try {
        data = await fetchAllAdminBuses();
      } catch {
        data = await fetchLiveBuses();
      }
      set({ buses: data.map(mapApiBus), isLoading: false });
    } catch (e) {
      console.error("[AdminStore] loadBuses failed:", e);
      set({ isLoading: false });
    }
  },

  loadDrivers: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchDrivers();
      set({ drivers: data.map(mapApiDriver), isLoading: false });
    } catch (e) {
      console.error("[AdminStore] loadDrivers failed:", e);
      set({ isLoading: false });
    }
  },

  loadSchedules: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchSchedules();
      set({ schedules: data.map(mapApiSchedule), isLoading: false });
    } catch (e) {
      console.error("[AdminStore] loadSchedules failed:", e);
      set({ isLoading: false });
    }
  },

  loadTodayTrips: async (targetDate?: string) => {
    set({ isLoading: true });
    try {
      // If no date provided, use local "today" to ensure consistency with what we generate
      const dateStr = targetDate ?? new Date().toISOString().split("T")[0]!;
      const data = await fetchTodayTrips(dateStr);
      set({ plannedTrips: data.map(mapApiTrip), isLoading: false });
    } catch (e) {
      console.error("[AdminStore] loadTodayTrips failed:", e);
      set({ isLoading: false });
    }
  },

  deleteRoute: async (id) => {
    try {
      await deleteRouteApi(id);
    } catch (e) {
      console.warn("[AdminStore] deleteRoute API failed:", e);
    }
    set((state) => ({ routes: state.routes.filter((r) => r.id !== id) }));
  },

  addBus: async (payload) => {
    await createBus({
      fleet_code: payload.busType || "Standard",
      plate_number: payload.busNumber,
      capacity: payload.seatCapacity,
    });
    // Re-fetch from API to get server-assigned ID and reflect real state
    try {
      let data;
      try { data = await fetchAllAdminBuses(); } catch { data = await fetchLiveBuses(); }
      set({ buses: data.map(mapApiBus) });
    } catch (e) {
      console.warn("[AdminStore] addBus re-fetch failed:", e);
    }
  },

  updateBusStatus: async (id, status) => {
    try {
      await updateBus(id, { status: status.toLowerCase() });
    } catch (e) {
      console.warn("[AdminStore] updateBus API failed:", e);
    }
    set((state) => ({
      buses: state.buses.map((b) => (b.id === id ? { ...b, status } : b)),
    }));
  },

  updateBusFull: async (id, data) => {
    await updateBus(id, data);
    // Re-fetch to get fresh state
    try {
      let fresh;
      try { fresh = await fetchAllAdminBuses(); } catch { fresh = await fetchLiveBuses(); }
      set({ buses: fresh.map(mapApiBus) });
    } catch (e) {
      console.warn("[AdminStore] updateBusFull re-fetch failed:", e);
    }
  },

  deleteBus: async (id) => {
    await deleteBusApi(id);
    set((state) => ({ buses: state.buses.filter((b) => b.id !== id) }));
  },

  addDriver: async (data) => {
    const created = await createDriver(data);
    set((state) => ({ drivers: [...state.drivers, mapApiDriver(created)] }));
  },

  deleteDriver: async (id) => {
    await deleteDriverApi(id);
    set((state) => ({ drivers: state.drivers.filter((d) => d.id !== id) }));
  },

  assignBusToRoute: async (busId, routeId) => {
    await assignBusToRouteApi(busId, routeId);
    set((state) => ({
      buses: state.buses.map((b) => b.id === busId ? { ...b, routeId } : b),
    }));
  },

  unassignBus: async (busId) => {
    await unassignBusApi(busId);
    set((state) => ({
      buses: state.buses.map((b) => b.id === busId ? { ...b, routeId: null } : b),
    }));
  },

  overrideDelay: async (tripId, delayMinutes) => {
    const updated = await overrideTripDelay(tripId, delayMinutes);
    set((state) => ({
      plannedTrips: state.plannedTrips.map((t) =>
        t.id === tripId ? mapApiTrip(updated) : t,
      ),
    }));
  },

  logIncident: async (tripId, incidentType, description) => {
    const updated = await logTripIncident(tripId, incidentType, description);
    set((state) => ({
      plannedTrips: state.plannedTrips.map((t) =>
        t.id === tripId ? mapApiTrip(updated) : t,
      ),
    }));
  },

  addSchedule: async (data) => {
    const created = await createScheduleApi(data);
    set((state) => ({ schedules: [...state.schedules, mapApiSchedule(created)] }));
  },

  generateTodayTrips: async () => {
    const today = new Date().toISOString().split("T")[0]!;
    await generateTrips(today);
  },

  assignTrip: async (tripId, busId, driverId) => {
    const updated = await assignTripResources(tripId, busId, driverId);
    set((state) => ({
      plannedTrips: state.plannedTrips.map((t) =>
        t.id === tripId ? mapApiTrip(updated) : t,
      ),
    }));
  },
}));
