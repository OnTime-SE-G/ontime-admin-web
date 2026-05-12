"use client";

import {
  AlertCircle,
  Bus as BusIcon,
  CheckCircle2,
  Edit,
  Link2,
  Link2Off,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useAdminStore } from "@/lib/store/admin-store";
import type { Bus, BusStatus } from "@/lib/types";

type BusForm = {
  plate_number: string;
  fleet_code: string;
  capacity: string;
  status: BusStatus;
};

const defaultForm: BusForm = { plate_number: "", fleet_code: "", capacity: "", status: "Active" };

export default function BusesPage() {
  const {
    buses, routes,
    addBus, updateBusFull, deleteBus, loadBuses,
    loadRoutes, assignBusToRoute, unassignBus,
  } = useAdminStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Bus | null>(null);
  const [editForm, setEditForm] = useState<BusForm>(defaultForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<BusForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Route assignment
  const [assigningBus, setAssigningBus] = useState<Bus | null>(null);
  const [pendingRouteId, setPendingRouteId] = useState("");
  const [savingRoute, setSavingRoute] = useState(false);

  useEffect(() => {
    void Promise.all([loadBuses(), loadRoutes()]);
  }, [loadBuses, loadRoutes]);

  const deletingBus = useMemo(() => buses.find((b) => b.id === deletingId) ?? null, [buses, deletingId]);
  const activeBuses = buses.filter((b) => b.status === "Active").length;
  const maintenanceBuses = buses.filter((b) => b.status === "Maintenance").length;

  const openEdit = (bus: Bus) => {
    setEditing(bus);
    setEditForm({ plate_number: bus.busNumber, fleet_code: bus.busType, capacity: String(bus.seatCapacity), status: bus.status });
  };

  const openAssign = (bus: Bus) => {
    setAssigningBus(bus);
    setPendingRouteId(bus.routeId ?? "");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plate_number || !form.fleet_code || !form.capacity) { toast.error("Please fill all fields"); return; }
    setSaving(true);
    try {
      await addBus({ busNumber: form.plate_number, busType: form.fleet_code, status: form.status, seatCapacity: Number(form.capacity), routeId: null });
      toast.success("Bus added");
      setIsAddOpen(false);
      setForm(defaultForm);
    } catch { toast.error("Failed to add bus"); } finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await updateBusFull(editing.id, { plate_number: editForm.plate_number, fleet_code: editForm.fleet_code, capacity: Number(editForm.capacity), status: editForm.status.toLowerCase() });
      toast.success("Bus updated");
      setEditing(null);
    } catch { toast.error("Failed to update bus"); } finally { setSaving(false); }
  };

  const handleAssignRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBus) return;
    setSavingRoute(true);
    try {
      if (pendingRouteId) {
        await assignBusToRoute(assigningBus.id, pendingRouteId);
        toast.success("Route assigned");
      } else {
        await unassignBus(assigningBus.id);
        toast.success("Bus unassigned from route");
      }
      setAssigningBus(null);
    } catch { toast.error("Failed to update route assignment"); } finally { setSavingRoute(false); }
  };

  const handleUnassign = async (busId: string) => {
    try {
      await unassignBus(busId);
      toast.success("Bus unassigned from route");
    } catch { toast.error("Failed to unassign bus"); }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteBus(deletingId);
      toast.success("Bus deleted");
      setDeletingId(null);
    } catch { toast.error("Failed to delete bus"); } finally { setDeleting(false); }
  };

  const routeName = (routeId: string | null) => {
    if (!routeId) return null;
    const r = routes.find((r) => r.id === routeId);
    return r ? (r.startStation + (r.endStation ? ` → ${r.endStation}` : "")) : `Route #${routeId}`;
  };

  const fieldCls = "w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 ring-primary";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">Manage Buses</h1>
          <p className="text-on-surface-variant text-base mt-1">Oversee your fleet — add, edit, and remove buses.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[0.98]">
          <Plus size={18} /> Add Bus
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant"><BusIcon size={18} className="text-primary" /><span className="text-sm font-medium uppercase tracking-wider">Total Fleet</span></div>
          <div className="text-4xl font-black text-on-surface">{buses.length}</div>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant"><CheckCircle2 size={18} className="text-emerald-600" /><span className="text-sm font-medium uppercase tracking-wider">Active</span></div>
          <div className="text-4xl font-black text-on-surface">{activeBuses}</div>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant"><Wrench size={18} className="text-amber-600" /><span className="text-sm font-medium uppercase tracking-wider">Maintenance</span></div>
          <div className="text-4xl font-black text-on-surface">{maintenanceBuses}</div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="rounded-xl bg-surface-container-lowest shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h2 className="text-base font-bold text-on-surface">Fleet Roster</h2>
        </div>
        {buses.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">No buses found. Add one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-on-surface-variant uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Plate Number</th>
                  <th className="px-6 py-3 text-left">Fleet Code</th>
                  <th className="px-6 py-3 text-left">Capacity</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Route</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {buses.map((bus) => {
                  const assigned = routeName(bus.routeId);
                  return (
                    <tr key={bus.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{bus.id}</td>
                      <td className="px-6 py-4 font-semibold text-on-surface">{bus.busNumber}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{bus.busType || "—"}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{bus.seatCapacity}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bus.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bus.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {bus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {assigned ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-on-surface-variant truncate max-w-[140px]">{assigned}</span>
                            <button onClick={() => handleUnassign(bus.id)} className="p-1 rounded text-on-surface-variant hover:text-error transition-colors flex-shrink-0" title="Unassign route"><Link2Off size={13} /></button>
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openAssign(bus)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" title="Assign route"><Link2 size={15} /></button>
                          <button onClick={() => openEdit(bus)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" title="Edit"><Edit size={15} /></button>
                          <button onClick={() => setDeletingId(bus.id)} className="p-2 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setForm(defaultForm); }} title="Add New Bus">
        <form onSubmit={handleAdd} className="space-y-4 px-1">
          <div><label className="block text-sm font-medium text-on-surface mb-1">Plate Number</label><input className={fieldCls} placeholder="e.g. WP CAB 3456" value={form.plate_number} onChange={(e) => setForm((f) => ({ ...f, plate_number: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-on-surface mb-1">Fleet Code</label><input className={fieldCls} placeholder="e.g. BUS-001" value={form.fleet_code} onChange={(e) => setForm((f) => ({ ...f, fleet_code: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-on-surface mb-1">Seat Capacity</label><input type="number" min={1} className={fieldCls} placeholder="e.g. 50" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-on-surface mb-1">Status</label>
            <select className={fieldCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BusStatus }))}>
              <option value="Active">Active</option><option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setIsAddOpen(false); setForm(defaultForm); }} className="flex-1 rounded-xl bg-surface-container-high py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? "Adding..." : "Add Bus"}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Bus">
        <form onSubmit={handleEdit} className="space-y-4 px-1">
          <div><label className="block text-sm font-medium text-on-surface mb-1">Plate Number</label><input className={fieldCls} value={editForm.plate_number} onChange={(e) => setEditForm((f) => ({ ...f, plate_number: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-on-surface mb-1">Fleet Code</label><input className={fieldCls} value={editForm.fleet_code} onChange={(e) => setEditForm((f) => ({ ...f, fleet_code: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-on-surface mb-1">Seat Capacity</label><input type="number" min={1} className={fieldCls} value={editForm.capacity} onChange={(e) => setEditForm((f) => ({ ...f, capacity: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-on-surface mb-1">Status</label>
            <select className={fieldCls} value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as BusStatus }))}>
              <option value="Active">Active</option><option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-xl bg-surface-container-high py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* Assign Route Modal */}
      <Modal isOpen={!!assigningBus} onClose={() => setAssigningBus(null)} title="Assign Route">
        <form onSubmit={handleAssignRoute} className="space-y-4 px-1">
          <p className="text-sm text-on-surface-variant">
            Bus <span className="font-semibold text-on-surface">{assigningBus?.busNumber}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Route</label>
            <select className={fieldCls} value={pendingRouteId} onChange={(e) => setPendingRouteId(e.target.value)}>
              <option value="">— Unassigned —</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.startStation}{r.endStation ? ` → ${r.endStation}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAssigningBus(null)} className="flex-1 rounded-xl bg-surface-container-high py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
            <button type="submit" disabled={savingRoute} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50">{savingRoute ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Bus">
        <div className="space-y-4 px-1">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant">Delete bus <span className="font-semibold text-on-surface">{deletingBus?.busNumber}</span>? This cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setDeletingId(null)} className="flex-1 rounded-xl bg-surface-container-high py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
            <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-xl bg-error py-3 text-sm font-semibold text-white hover:bg-error/90 transition-colors disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
