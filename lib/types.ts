export type RouteStatus = "Active" | "Inactive";
export type BusStatus = "Active" | "Maintenance";
export type DriverStatus = "Active" | "On Vacation";

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

export type Driver = {
  id: string;
  name: string;
  idNumber: string;
  licenseNumber: string;
  age: number;
  birthdate: string;
  address: string;
  status: DriverStatus;
};

export type RosterAssignment = {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  status: "Assigned";
};
