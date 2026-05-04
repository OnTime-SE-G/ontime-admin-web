"use client";

import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "@/lib/store/admin-store";
import { addRouteKml, updateRouteKml } from "@/lib/api";
import type { TransitRoute } from "@/lib/types";

export default function RoutesPage() {
  const { routes, deleteRoute, loadRoutes } = useAdminStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransitRoute | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [routeName, setRouteName] = useState("");
  const [kmlFile, setKmlFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadRoutes(); }, [loadRoutes]);

  const deletingRoute = useMemo(
    () => routes.find((r) => r.id === deletingId) || null,
    [routes, deletingId],
  );

  const resetForm = () => {
    setRouteName("");
    setKmlFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEdit = (route: TransitRoute) => {
    setRouteName(route.startStation + (route.endStation ? ` - ${route.endStation}` : ""));
    setKmlFile(null);
    setEditingRoute(route);
  };

  const submitAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!kmlFile) { toast.error("Please select a KML file"); return; }
    setSubmitting(true);
    try {
      await addRouteKml(routeName, kmlFile);
      toast.success("Route added");
      setIsAddOpen(false);
      resetForm();
      await loadRoutes();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add route");
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingRoute || !kmlFile) { toast.error("Please select a KML file"); return; }
    setSubmitting(true);
    try {
      await updateRouteKml(editingRoute.id, routeName, kmlFile);
      toast.success("Route updated");
      setEditingRoute(null);
      resetForm();
      await loadRoutes();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update route");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await deleteRoute(deletingId);
    toast.success("Deleted successfully");
    setDeletingId(null);
  };

  const KmlFormFields = (
    <div className="space-y-4">
      <label className="text-sm">
        <span className="mb-2 block font-semibold text-on-surface-variant">Route Name</span>
        <input
          required
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          placeholder="e.g. Colombo - Piliyandala"
          className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>
      <label className="text-sm">
        <span className="mb-2 block font-semibold text-on-surface-variant">KML File</span>
        <div
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-surface-container-high bg-surface-container-lowest px-4 py-6 transition hover:border-primary/40"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={22} className="text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">
            {kmlFile ? kmlFile.name : "Click to upload .kml file"}
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".kml"
          className="hidden"
          onChange={(e) => setKmlFile(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Manage Routes</h1>
          <p className="text-sm text-on-surface-variant">
            Active network configuration and scheduling
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[0.98]"
        >
          <Plus size={16} /> Add Route
        </button>
      </div>

      <Table>
        <thead>
          <tr className="bg-surface-container-low text-on-surface-variant">
            <th className="px-5 py-4 text-left">Route</th>
            <th className="px-5 py-4 text-left">Number</th>
            <th className="px-5 py-4 text-left">Status</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id} className="border-t border-surface-container-high">
              <td className="px-5 py-4 font-semibold">
                {route.startStation}{route.endStation ? ` → ${route.endStation}` : ""}
              </td>
              <td className="px-5 py-4 text-on-surface-variant">{route.routeNumber}</td>
              <td className="px-5 py-4"><StatusBadge status={route.status} /></td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(route)}
                    className="rounded-lg bg-surface-container-high p-2 text-on-surface-variant transition hover:text-primary"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(route.id)}
                    className="rounded-lg bg-surface-container-high p-2 text-on-surface-variant transition hover:text-error"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Route Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Route">
        <form className="space-y-4" onSubmit={submitAdd}>
          {KmlFormFields}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Uploading..." : "Add Route"}
          </button>
        </form>
      </Modal>

      {/* Edit Route Modal */}
      <Modal isOpen={Boolean(editingRoute)} onClose={() => setEditingRoute(null)} title="Replace Route KML">
        <form className="space-y-4" onSubmit={submitEdit}>
          {KmlFormFields}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Uploading..." : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={Boolean(deletingRoute)} onClose={() => setDeletingId(null)} title="Delete Route">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Delete {deletingRoute?.startStation}{deletingRoute?.endStation ? ` → ${deletingRoute.endStation}` : ""}? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-xl bg-error px-4 py-2 text-sm font-semibold text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
