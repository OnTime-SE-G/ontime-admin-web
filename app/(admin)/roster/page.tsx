"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Table } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAdminStore } from "@/lib/store/admin-store";

export default function RosterPage() {
  const {
    routes,
    buses,
    drivers,
    plannedTrips,
    loadTodayTrips,
    loadBuses,
    loadDrivers,
    loadRoutes,
    generateTodayTrips,
    assignTrip,
  } = useAdminStore();

  const [generating, setGenerating] = useState(false);
  // per-trip selected bus/driver while assigning
  const [pendingBus, setPendingBus] = useState<Record<string, string>>({});
  const [pendingDriver, setPendingDriver] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([loadTodayTrips(), loadBuses(), loadDrivers(), loadRoutes()]);
  }, [loadTodayTrips, loadBuses, loadDrivers, loadRoutes]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateTodayTrips();
      await loadTodayTrips();
      toast.success("Trips generated for today");
    } catch {
      toast.error("Failed to generate trips");
    } finally {
      setGenerating(false);
    }
  };

  const handleAssign = async (tripId: string) => {
    const busId = pendingBus[tripId];
    const driverId = pendingDriver[tripId];
    if (!busId || !driverId) {
      toast.error("Select both a bus and a driver");
      return;
    }
    setAssigning(tripId);
    try {
      await assignTrip(tripId, Number(busId), Number(driverId));
      toast.success("Assigned successfully");
      setPendingBus((p) => { const c = { ...p }; delete c[tripId]; return c; });
      setPendingDriver((p) => { const c = { ...p }; delete c[tripId]; return c; });
    } catch {
      toast.error("Failed to assign");
    } finally {
      setAssigning(null);
    }
  };

  const tripStatusLabel = (status: string) => {
    if (status === "WAITING_AT_DEPOT") return "Not Started";
    if (status === "EN_ROUTE") return "En Route";
    if (status === "ARRIVED_DESTINATION") return "Arrived";
    if (status === "INCIDENT_REPORTED") return "Incident";
    return status;
  };

  const selectClass =
    "w-full rounded-xl bg-surface-container-high px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Roster Management</h1>
          <p className="text-sm text-on-surface-variant">
            Assign buses and drivers to today&apos;s planned trips
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {generating ? "Generating..." : "Generate Today's Trips"}
        </button>
      </div>

      {plannedTrips.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No trips for today. Click &quot;Generate Today&apos;s Trips&quot; to create them from schedules.
        </p>
      ) : (
        <Table>
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant">
              <th className="px-5 py-4 text-left">Route</th>
              <th className="px-5 py-4 text-left">Status</th>
              <th className="px-5 py-4 text-left">Bus</th>
              <th className="px-5 py-4 text-left">Driver</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {plannedTrips.map((trip) => {
              const schedule = trip.scheduleId;
              const route = routes.find((r) => r.id === String(schedule)) ?? routes[0];
              const assignedBus = buses.find((b) => String(b.id) === String(trip.busId));
              const assignedDriver = drivers.find((d) => d.id === String(trip.driverId));
              const isAssigned = trip.busId !== null && trip.driverId !== null;

              return (
                <tr key={trip.id} className="border-t border-surface-container-high">
                  <td className="px-5 py-4 font-semibold">
                    {route ? `${route.startStation} → ${route.endStation}` : `Schedule #${schedule}`}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={tripStatusLabel(trip.status)} />
                  </td>
                  <td className="px-5 py-4">
                    {isAssigned ? (
                      <span className="text-sm text-on-surface-variant">
                        {assignedBus?.busNumber ?? `Bus #${trip.busId}`}
                      </span>
                    ) : (
                      <select
                        value={pendingBus[trip.id] ?? ""}
                        onChange={(e) => setPendingBus((p) => ({ ...p, [trip.id]: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="">Select bus</option>
                        {buses.map((b) => (
                          <option key={b.id} value={b.id}>{b.busNumber}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isAssigned ? (
                      <span className="text-sm text-on-surface-variant">
                        {assignedDriver?.name ?? `Driver #${trip.driverId}`}
                      </span>
                    ) : (
                      <select
                        value={pendingDriver[trip.id] ?? ""}
                        onChange={(e) => setPendingDriver((p) => ({ ...p, [trip.id]: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="">Select driver</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {!isAssigned && (
                      <button
                        type="button"
                        disabled={assigning === trip.id}
                        onClick={() => handleAssign(trip.id)}
                        className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {assigning === trip.id ? "..." : "Assign"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </section>
  );
}
