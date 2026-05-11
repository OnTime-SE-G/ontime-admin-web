const BASE = process.env.NEXT_PUBLIC_G2_BASE_URL ?? 'http://localhost:8000';

export type ApiRoute = {
  id: number;
  name: string;
  route_number: string | null;
  color: string | null;
  destination: string | null;
};

export type ApiLiveBus = {
  id: string;
  fleet_code: string;
  plate_number: string;
  status: string;
  route_id: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type ApiDriver = {
  id: number;
  name: string;
  license_number: string;
  phone: string | null;
};

export type ApiSchedule = {
  id: number;
  route_id: number;
  scheduled_time: string;
  day_of_week: number;
};

export type ApiPlannedTrip = {
  id: string;
  schedule_id: number;
  bus_id: number | null;
  driver_id: number | null;
  date: string;
  status: string;
  actual_start_time: string | null;
  actual_end_time: string | null;
  delay_minutes: number;
  last_incident_type: string | null;
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ── Routes ────────────────────────────────────────────────────────────────────

export const fetchRoutes = () =>
  apiFetch<ApiRoute[]>('/api/v1/routes');

export const addRouteKml = (routeName: string, file: File) => {
  const form = new FormData();
  form.append('route_name', routeName);
  form.append('file', file);
  return apiFetch<Record<string, unknown>>('/api/v1/admin/routes/add-route', {
    method: 'POST',
    body: form,
  });
};

export const updateRouteKml = (id: string, routeName: string, file: File) => {
  const form = new FormData();
  form.append('route_name', routeName);
  form.append('file', file);
  return apiFetch<Record<string, unknown>>(`/api/v1/admin/routes/${id}`, {
    method: 'PUT',
    body: form,
  });
};

export const deleteRouteApi = (id: string) =>
  apiFetch<Record<string, unknown>>(`/api/v1/admin/routes/${id}`, { method: 'DELETE' });

// ── Buses ─────────────────────────────────────────────────────────────────────

export type ApiAdminBus = {
  id: string;
  fleet_code: string;
  plate_number: string;
  capacity: number | null;
  status: string;
  route_id: string | null;
  latitude: number | null;
  longitude: number | null;
};

export const fetchAllAdminBuses = () =>
  apiFetch<ApiAdminBus[]>('/api/v1/admin/fleet/buses');

export const fetchLiveBuses = () =>
  apiFetch<ApiLiveBus[]>('/api/v1/buses/live');

export const createBus = (data: { fleet_code: string; plate_number: string; capacity: number; status: string }) =>
  apiFetch<ApiLiveBus>('/api/v1/admin/fleet/buses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const updateBus = (id: string, data: Record<string, unknown>) =>
  apiFetch<ApiLiveBus>(`/api/v1/admin/fleet/buses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteBusApi = (id: string) =>
  apiFetch<Record<string, unknown>>(`/api/v1/admin/fleet/buses/${id}`, { method: 'DELETE' });

export const assignBusToRoute = (busId: string, routeId: string) =>
  apiFetch<Record<string, unknown>>(
    `/api/v1/admin/fleet/buses/${busId}/assign-route/${routeId}`,
    { method: 'POST' },
  );

export const unassignBus = (busId: string) =>
  apiFetch<Record<string, unknown>>(`/api/v1/admin/fleet/buses/${busId}/unassign`, {
    method: 'POST',
  });

// ── Drivers ───────────────────────────────────────────────────────────────────

export const fetchDrivers = () =>
  apiFetch<ApiDriver[]>('/api/v1/admin/fleet/drivers');

export const createDriver = (data: { name: string; license_number: string; phone?: string; username: string; password: string }) =>
  apiFetch<ApiDriver>('/api/v1/admin/fleet/drivers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteDriverApi = (id: string) =>
  apiFetch<Record<string, unknown>>(`/api/v1/admin/fleet/drivers/${id}`, { method: 'DELETE' });

// ── Schedules ─────────────────────────────────────────────────────────────────

export const fetchSchedules = () =>
  apiFetch<ApiSchedule[]>('/api/v1/admin/fleet/schedules');

export const createSchedule = (data: {
  route_id: number;
  scheduled_time: string;
  day_of_week: number;
}) =>
  apiFetch<ApiSchedule>('/api/v1/admin/fleet/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// ── Planned Trips ─────────────────────────────────────────────────────────────

export const fetchTodayTrips = () =>
  apiFetch<ApiPlannedTrip[]>('/api/v1/admin/fleet/planned-trips/today');

export const generateTrips = (targetDate: string) =>
  apiFetch<Record<string, unknown>>(
    `/api/v1/admin/fleet/planned-trips/generate?target_date=${targetDate}`,
    { method: 'POST' },
  );

export const assignTripResources = (tripId: string, busId: number, driverId: number) =>
  apiFetch<ApiPlannedTrip>(
    `/api/v1/admin/fleet/planned-trips/${tripId}/assign?bus_id=${busId}&driver_id=${driverId}`,
    { method: 'PATCH' },
  );

export const overrideTripDelay = (tripId: string, delayMinutes: number) =>
  apiFetch<ApiPlannedTrip>(`/api/v1/admin/fleet/planned-trips/${tripId}/delay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delay_minutes: delayMinutes }),
  });

export const logTripIncident = (tripId: string, incidentType: string, description?: string) =>
  apiFetch<ApiPlannedTrip>(`/api/v1/admin/fleet/planned-trips/${tripId}/incident`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident_type: incidentType, description }),
  });

export const fetchTripState = (tripId: string) =>
  apiFetch<Record<string, unknown>>(`/api/v1/trips/${tripId}/state`);
