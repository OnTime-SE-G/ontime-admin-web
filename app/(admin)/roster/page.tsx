"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { Table } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal } from "@/components/ui/modal";
import { useAdminStore } from "@/lib/store/admin-store";
import type { PlannedTrip } from "@/lib/types";

export default function RosterPage() {
  const {
    routes, buses, drivers, schedules, plannedTrips,
    loadTodayTrips, loadBuses, loadDrivers, loadRoutes, loadSchedules,
    generateTodayTrips, assignTrip, overrideDelay, logIncident,
  } = useAdminStore();

  const [generating, setGenerating] = useState(false);
  const [pendingBus, setPendingBus] = useState<Record<string, string>>({});
  const [pendingDriver, setPendingDriver] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState<string | null>(null);

  // Delay override modal
  const [delayTrip, setDelayTrip] = useState<PlannedTrip | null>(null);
  const [delayMinutes, setDelayMinutes] = useState("");
  const [savingDelay, setSavingDelay] = useState(false);

  // Incident log modal
  const [incidentTrip, setIncidentTrip] = useState<PlannedTrip | null>(null);
  const [incidentType, setIncidentType] = useState("breakdown");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [savingIncident, setSavingIncident] = useState(false);

  useEffect(() => {
    void Promise.all([loadTodayTrips(), loadBuses(), loadDrivers(), loadRoutes(), loadSchedules()]);
  }, [loadTodayTrips, loadBuses, loadDrivers, loadRoutes, loadSchedules]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateTodayTrips();
      await loadTodayTrips();
      toast.success("Trips generated for today");
    } catch { toast.error("Failed to generate trips"); } finally { setGenerating(false); }
  };

  const handleAssign = async (tripId: string) => {
    const busId = pendingBus[tripId];
    const driverId = pendingDriver[tripId];
    if (!busId || !driverId) { toast.error("Select both a bus and a driver"); return; }
    setAssigning(tripId);
    try {
      await assignTrip(tripId, Number(busId), Number(driverId));
      toast.success("Assigned successfully");
      setPendingBus((p) => { const c = { ...p }; delete c[tripId]; return c; });
      setPendingDriver((p) => { const c = { ...p }; delete c[tripId]; return c; });
    } catch { toast.error("Failed to assign"); } finally { setAssigning(null); }
  };

  const handleOverrideDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delayTrip) return;
    const mins = Number(delayMinutes);
    if (isNaN(mins) || mins < 0) { toast.error("Enter a valid delay in minutes"); return; }
    setSavingDelay(true);
    try {
      await overrideDelay(delayTrip.id, mins);
      toast.success(`Delay set to ${mins} min`);
      setDelayTrip(null);
      setDelayMinutes("");
    } catch { toast.error("Failed to set delay"); } finally { setSavingDelay(false); }
  };

  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTrip) return;
    setSavingIncident(true);
    try {
      await logIncident(incidentTrip.id, incidentType, incidentDesc || undefined);
      toast.success("Incident logged");
      setIncidentTrip(null);
      setIncidentDesc("");
    } catch { toast.error("Failed to log incident"); } finally { setSavingIncident(false); }
  };

  const tripStatusLabel = (status: string) => {
    if (status === "WAITING_AT_DEPOT") return "Not Started";
    if (status === "EN_ROUTE") return "En Route";
    if (status === "ARRIVED_DESTINATION") return "Arrived";
    if (status === "INCIDENT_REPORTED") return "Incident";
    return status;
  };

  const selectClass = "w-full rounded-xl bg-surface-container-high px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
  const inputCls = "w-full rounded-xl bg-surface-container-high px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Roster Management</h1>
          <p className="text-sm text-on-surface-variant">Assign buses and drivers to today&apos;s planned trips</p>
        </div>
        <button type="button" onClick={handleGenerate} disabled={generating} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {generating ? "Generating..." : "Generate Today's Trips"}
        </button>
      </div>

      {plannedTrips.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No trips for today. Click &quot;Generate Today&apos;s Trips&quot; to create them from schedules.</p>
      ) : (
        <Table>
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant">
              <th className="px-5 py-4 text-left">Route</th>
              <th className="px-5 py-4 text-left">Status</th>
              <th className="px-5 py-4 text-left">Delay</th>
              <th className="px-5 py-4 text-left">Bus</th>
              <th className="px-5 py-4 text-left">Driver</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plannedTrips.map((trip) => {
              const schedule = schedules.find((s) => String(s.id) === String(trip.scheduleId));
              const route = routes.find((r) => r.id === String(schedule?.routeId));
              const assignedBus = buses.find((b) => String(b.id) === String(trip.busId));
              const assignedDriver = drivers.find((d) => d.id === String(trip.driverId));
              const isAssigned = trip.busId !== null && trip.driverId !== null;

              return (
                <tr key={trip.id} className="border-t border-surface-container-high">
                  <td className="px-5 py-4 font-semibold">
                    {route ? `${route.startStation}${route.endStation ? ` → ${route.endStation}` : ""}` : `Schedule #${trip.scheduleId}`}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={tripStatusLabel(trip.status)} /></td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant">
                    {trip.delayMinutes ? (
                      <span className="text-amber-600 font-medium">+{trip.delayMinutes} min</span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {isAssigned ? (
                      <span className="text-sm text-on-surface-variant">{assignedBus?.busNumber ?? `Bus #${trip.busId}`}</span>
                    ) : (
                      <select value={pendingBus[trip.id] ?? ""} onChange={(e) => setPendingBus((p) => ({ ...p, [trip.id]: e.target.value }))} className={selectClass}>
                        <option value="">Select bus</option>
                        {buses.map((b) => <option key={b.id} value={b.id}>{b.busNumber}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isAssigned ? (
                      <span className="text-sm text-on-surface-variant">{assignedDriver?.name ?? `Driver #${trip.driverId}`}</span>
                    ) : (
                      <select value={pendingDriver[trip.id] ?? ""} onChange={(e) => setPendingDriver((p) => ({ ...p, [trip.id]: e.target.value }))} className={selectClass}>
                        <option value="">Select driver</option>
                        {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {!isAssigned && (
                        <button type="button" disabled={assigning === trip.id} onClick={() => handleAssign(trip.id)} className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
                          {assigning === trip.id ? "..." : "Assign"}
                        </button>
                      )}
                      <button type="button" onClick={() => { setDelayTrip(trip); setDelayMinutes(String(trip.delayMinutes ?? 0)); }} className="rounded-lg bg-amber-100 p-1.5 text-amber-700 hover:bg-amber-200 transition-colors" title="Override delay">
                        <Clock size={14} />
                      </button>
                      <button type="button" onClick={() => setIncidentTrip(trip)} className="rounded-lg bg-red-100 p-1.5 text-red-700 hover:bg-red-200 transition-colors" title="Log incident">
                        <AlertTriangle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Override Delay Modal */}
      <Modal isOpen={!!delayTrip} onClose={() => setDelayTrip(null)} title="Override Trip Delay">
        <form onSubmit={handleOverrideDelay} className="space-y-4">
          <p className="text-sm text-on-surface-variant">Set the delay in minutes for this trip. Use 0 to clear a delay.</p>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Delay (minutes)</label>
            <input type="number" min={0} className={inputCls} value={delayMinutes} onChange={(e) => setDelayMinutes(e.target.value)} placeholder="e.g. 15" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDelayTrip(null)} className="flex-1 rounded-xl bg-surface-container-high py-2.5 text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={savingDelay} className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingDelay ? "Saving..." : "Set Delay"}</button>
          </div>
        </form>
      </Modal>

      {/* Log Incident Modal */}
      <Modal isOpen={!!incidentTrip} onClose={() => setIncidentTrip(null)} title="Log Incident">
        <form onSubmit={handleLogIncident} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Incident Type</label>
            <select className={inputCls} value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
              <option value="breakdown">Breakdown</option>
              <option value="accident">Accident</option>
              <option value="delay">Delay</option>
              <option value="passenger_issue">Passenger Issue</option>
              <option value="road_closure">Road Closure</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Description (optional)</label>
            <textarea rows={3} className={inputCls} value={incidentDesc} onChange={(e) => setIncidentDesc(e.target.value)} placeholder="Describe the incident..." />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIncidentTrip(null)} className="flex-1 rounded-xl bg-surface-container-high py-2.5 text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={savingIncident} className="flex-1 rounded-xl bg-error py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingIncident ? "Logging..." : "Log Incident"}</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
