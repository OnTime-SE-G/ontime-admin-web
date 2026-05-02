"use client";

import { create } from "zustand";
import type {
  Bus,
  BusStatus,
  Driver,
  DriverStatus,
  RosterAssignment,
  TransitRoute,
} from "@/lib/types";

type NewRoute = Omit<TransitRoute, "id">;
type NewBus = Omit<Bus, "id">;
type NewDriver = Omit<Driver, "id">;

type AdminStore = {
  routes: TransitRoute[];
  buses: Bus[];
  drivers: Driver[];
  rosterAssignments: RosterAssignment[];
  addRoute: (payload: NewRoute) => void;
  updateRoute: (id: string, payload: NewRoute) => void;
  deleteRoute: (id: string) => void;
  addBus: (payload: NewBus) => void;
  updateBusStatus: (id: string, status: BusStatus) => void;
  deleteBus: (id: string) => void;
  addDriver: (payload: NewDriver) => void;
  updateDriverStatus: (id: string, status: DriverStatus) => void;
  deleteDriver: (id: string) => void;
  assignRoster: (routeId: string, busId: string, driverId: string) => void;
  deleteAssignment: (id: string) => void;
};

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const initialRoutes: TransitRoute[] = [
  {
    id: makeId(),
    routeNumber: "138",
    startStation: "Colombo",
    endStation: "Piliyandala",
    stops: ["Borella", "Nugegoda", "Maharagama"],
    status: "Active",
  },
  {
    id: makeId(),
    routeNumber: "256",
    startStation: "Fort",
    endStation: "Maharagama",
    stops: ["Town Hall", "Kirulapona", "Nugegoda"],
    status: "Active",
  },
  {
    id: makeId(),
    routeNumber: "412",
    startStation: "Panadura",
    endStation: "Pettah",
    stops: ["Moratuwa", "Katubedda", "Wellawatte"],
    status: "Inactive",
  },
];

const initialBuses: Bus[] = [
  {
    id: makeId(),
    busNumber: "OT-1024",
    busType: "AC",
    status: "Active",
    seatCapacity: 54,
  },
  {
    id: makeId(),
    busNumber: "OT-1088",
    busType: "Standard",
    status: "Maintenance",
    seatCapacity: 48,
  },
  {
    id: makeId(),
    busNumber: "OT-1102",
    busType: "Luxury",
    status: "Active",
    seatCapacity: 42,
  },
];

const initialDrivers: Driver[] = [
  {
    id: makeId(),
    name: "Kasun Perera",
    idNumber: "901234567V",
    licenseNumber: "B540123",
    age: 34,
    birthdate: "1992-01-16",
    address: "Nugegoda",
    status: "Active",
  },
  {
    id: makeId(),
    name: "Nimal Silva",
    idNumber: "880123454V",
    licenseNumber: "B540321",
    age: 38,
    birthdate: "1988-07-04",
    address: "Rajagiriya",
    status: "On Vacation",
  },
  {
    id: makeId(),
    name: "Ruwan Jayasinghe",
    idNumber: "910543298V",
    licenseNumber: "B540654",
    age: 32,
    birthdate: "1994-09-22",
    address: "Dehiwala",
    status: "Active",
  },
];

const initialAssignments: RosterAssignment[] = [
  {
    id: makeId(),
    routeId: initialRoutes[0].id,
    busId: initialBuses[0].id,
    driverId: initialDrivers[0].id,
    status: "Assigned",
  },
];

export const useAdminStore = create<AdminStore>((set) => ({
  routes: initialRoutes,
  buses: initialBuses,
  drivers: initialDrivers,
  rosterAssignments: initialAssignments,

  addRoute: (payload) =>
    set((state) => ({
      routes: [...state.routes, { id: makeId(), ...payload }],
    })),

  updateRoute: (id, payload) =>
    set((state) => ({
      routes: state.routes.map((route) =>
        route.id === id ? { ...route, ...payload } : route,
      ),
    })),

  deleteRoute: (id) =>
    set((state) => ({
      routes: state.routes.filter((route) => route.id !== id),
      rosterAssignments: state.rosterAssignments.filter(
        (assignment) => assignment.routeId !== id,
      ),
    })),

  addBus: (payload) =>
    set((state) => ({
      buses: [...state.buses, { id: makeId(), ...payload }],
    })),

  updateBusStatus: (id, status) =>
    set((state) => ({
      buses: state.buses.map((bus) =>
        bus.id === id ? { ...bus, status } : bus,
      ),
    })),

  deleteBus: (id) =>
    set((state) => ({
      buses: state.buses.filter((bus) => bus.id !== id),
      rosterAssignments: state.rosterAssignments.filter(
        (assignment) => assignment.busId !== id,
      ),
    })),

  addDriver: (payload) =>
    set((state) => ({
      drivers: [...state.drivers, { id: makeId(), ...payload }],
    })),

  updateDriverStatus: (id, status) =>
    set((state) => ({
      drivers: state.drivers.map((driver) =>
        driver.id === id ? { ...driver, status } : driver,
      ),
    })),

  deleteDriver: (id) =>
    set((state) => ({
      drivers: state.drivers.filter((driver) => driver.id !== id),
      rosterAssignments: state.rosterAssignments.filter(
        (assignment) => assignment.driverId !== id,
      ),
    })),

  assignRoster: (routeId, busId, driverId) =>
    set((state) => ({
      rosterAssignments: [
        ...state.rosterAssignments,
        {
          id: makeId(),
          routeId,
          busId,
          driverId,
          status: "Assigned",
        },
      ],
    })),

  deleteAssignment: (id) =>
    set((state) => ({
      rosterAssignments: state.rosterAssignments.filter(
        (assignment) => assignment.id !== id,
      ),
    })),
}));
