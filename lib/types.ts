export type RouteStatus = "Active" | "Inactive";
export type BusStatus = "Active" | "Maintenance";

export type TransitRoute = {
  id: string;
  routeNumber: string;
  startStation: string;
  endStation: string;
  stops: string[];
  status: RouteStatus;
};

export type Bus = {
  id: string;
  busNumber: string;
  busType: string;
  status: BusStatus;
  seatCapacity: number;
};

// Matches backend DriverResponse — only fields the API supports
export type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
};

export type Schedule = {
  id: string;
  routeId: number;
  scheduledTime: string;
  dayOfWeek: number;
};

export type PlannedTrip = {
  id: string;
  scheduleId: number;
  busId: number | null;
  driverId: number | null;
  date: string;
  status: string;
  delayMinutes: number;
  lastIncidentType: string | null;
};
