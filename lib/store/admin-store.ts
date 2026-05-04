"use client";

import { create } from "zustand";
import type { Bus, BusStatus, Driver, PlannedTrip, Schedule, TransitRoute } from "@/lib/types";
import {
  fetchRoutes,
  fetchLiveBuses,
  createBus,
  updateBus,
  deleteBusApi,
  deleteRouteApi,
  fetchDrivers,
  createDriver,
  fetchSchedules,
  createSchedule as createScheduleApi,
  fetchTodayTrips,
  generateTrips,
  assignTripResources,
  type ApiRoute,
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
  loadTodayTrips: () => Promise<void>;

  deleteRoute: (id: string) => Promise<void>;

  addBus: (payload: NewBus) => Promise<void>;
  updateBusStatus: (id: string, status: BusStatus) => Promise<void>;
  deleteBus: (id: string) => Promise<void>;

  addDriver: (data: { name: string; license_number: string; phone?: string }) => Promise<void>;
  addSchedule: (data: { route_id: number; scheduled_time: string; day_of_week: number }) => Promise<void>;
  generateTodayTrips: () => Promise<void>;
  assignTrip: (tripId: string, busId: number, driverId: number) => Promise<void>;
};

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

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

function mapApiBus(b: ApiLiveBus): Bus {
  return {
    id: b.id,
    busNumber: b.plate_number || b.id,
    busType: b.fleet_code || "Standard",
    status: ["active", "Active", "ACTIVE"].includes(b.status) ? "Active" : "Maintenance",
    seatCapacity: 0,
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
      const data = await fetchLiveBuses();
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

  loadTodayTrips: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchTodayTrips();
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
    try {
      await createBus({
        fleet_code: payload.busType || "Standard",
        plate_number: payload.busNumber,
        capacity: payload.seatCapacity,
      });
    } catch (e) {
      console.warn("[AdminStore] createBus API failed:", e);
    }
    set((state) => ({ buses: [...state.buses, { id: makeId(), ...payload }] }));
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

  deleteBus: async (id) => {
    try {
      await deleteBusApi(id);
    } catch (e) {
      console.warn("[AdminStore] deleteBus API failed:", e);
    }
    set((state) => ({ buses: state.buses.filter((b) => b.id !== id) }));
  },

  addDriver: async (data) => {
    const created = await createDriver(data);
    set((state) => ({ drivers: [...state.drivers, mapApiDriver(created)] }));
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
