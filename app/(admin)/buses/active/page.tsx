"use client";

import { Bus, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LiveMap } from "@/components/map/live-map";
import { Modal } from "@/components/ui/modal";
import { useAdminStore } from "@/lib/store/admin-store";

const ACTIVE_STATUSES = new Set(["EN_ROUTE", "in_progress", "WAITING_AT_DEPOT", "INCIDENT_REPORTED"]);

function tripStatusBadge(status: string) {
  if (status === "EN_ROUTE" || status === "in_progress")
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />In Transit</span>;
  if (status === "WAITING_AT_DEPOT")
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">At Depot</span>;
  if (status === "INCIDENT_REPORTED")
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Incident</span>;
  return <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">{status}</span>;
}

export default function ActiveBusesPage() {
  const { buses, routes, schedules, drivers, plannedTrips, loadBuses, loadRoutes, loadSchedules, loadDrivers, loadTodayTrips } = useAdminStore();

  useEffect(() => {
    void Promise.all([loadBuses(), loadRoutes(), loadSchedules(), loadDrivers(), loadTodayTrips()]);
  }, [loadBuses, loadRoutes, loadSchedules, loadDrivers, loadTodayTrips]);

  const [mapAssignmentId, setMapAssignmentId] = useState<string | null>(null);

  const activeAssignments = useMemo(
    () =>
      plannedTrips
        .filter((trip) => trip.busId !== null && ACTIVE_STATUSES.has(trip.status))
        .map((trip) => {
          const bus = buses.find((b) => String(b.id) === String(trip.busId));
          // Fix: look up route through schedules
          const schedule = schedules.find((s) => String(s.id) === String(trip.scheduleId));
          const route = routes.find((r) => r.id === String(schedule?.routeId));
          const driver = drivers.find((d) => d.id === String(trip.driverId));
          return {
            assignmentId: trip.id,
            busNumber: bus?.busNumber ?? `Bus #${trip.busId ?? "—"}`,
            routeLabel: route ? `${route.startStation} → ${route.endStation}` : `Schedule #${trip.scheduleId}`,
            startStation: route?.startStation ?? "?",
            driverName: driver?.name ?? "Unassigned",
            status: trip.status,
            delayMinutes: trip.delayMinutes,
          };
        }),
    [plannedTrips, buses, routes, schedules, drivers],
  );

  const selected = activeAssignments.find((a) => a.assignmentId === mapAssignmentId);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-on-surface">Active Buses</h1>
        <p className="text-sm text-on-surface-variant mt-2">Real-time status of deployed fleet.</p>
      </div>

      <div className="rounded-xl bg-surface-container-lowest shadow-soft overflow-hidden">
        {activeAssignments.length === 0 ? (
          <div className="p-8 text-center text-sm text-on-surface-variant">No active bus assignments. Generate and assign trips from the Roster page.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-container-high bg-surface-container-low">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Bus</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Route</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Delay</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeAssignments.map((assignment) => (
                  <tr key={assignment.assignmentId} className="border-b border-surface-container-high hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0"><Bus size={16} /></div>
                        <span className="font-semibold text-on-surface">{assignment.busNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[200px] truncate">{assignment.routeLabel}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{assignment.driverName.charAt(0).toUpperCase()}</div>
                        <span className="text-sm font-medium text-on-surface">{assignment.driverName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {assignment.delayMinutes ? <span className="text-amber-600 font-medium">+{assignment.delayMinutes} min</span> : <span className="text-on-surface-variant">—</span>}
                    </td>
                    <td className="px-6 py-4">{tripStatusBadge(assignment.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => setMapAssignmentId(assignment.assignmentId)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high text-primary hover:bg-primary/10 transition-colors font-medium text-sm">
                        <MapPin size={16} /> View Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => setMapAssignmentId(null)} title={selected ? `${selected.busNumber} — Live Tracking` : "Live Tracking"}>
        <div className="w-full h-[600px]">
          {selected && <LiveMap routeLabel={selected.routeLabel} />}
        </div>
      </Modal>
    </section>
  );
}
