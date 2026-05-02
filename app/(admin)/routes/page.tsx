"use client";

import {
  ChevronDown,
  CirclePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "@/lib/store/admin-store";
import type { RouteStatus, TransitRoute } from "@/lib/types";

type RouteForm = {
  routeNumber: string;
  startStation: string;
  endStation: string;
  stops: string;
  status: RouteStatus;
};

const emptyForm: RouteForm = {
  routeNumber: "",
  startStation: "",
  endStation: "",
  stops: "",
  status: "Active",
};

export default function RoutesPage() {
  const { routes, addRoute, updateRoute, deleteRoute } = useAdminStore();
  const [editing, setEditing] = useState<TransitRoute | null>(null);
  const [form, setForm] = useState<RouteForm>(emptyForm);
  const [stopsInput, setStopsInput] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletingRoute = useMemo(
    () => routes.find((r) => r.id === deletingId) || null,
    [routes, deletingId],
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (route: TransitRoute) => {
    setEditing(route);
    setForm({
      routeNumber: route.routeNumber || "",
      startStation: route.startStation || "",
      endStation: route.endStation || "",
      stops: route.stops ? route.stops.join(", ") : "",
      status: route.status || "Active",
    });
    setIsFormOpen(true);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      routeNumber: form.routeNumber,
      startStation: form.startStation,
      endStation: form.endStation,
      stops: form.stops
        .split(",")
        .map((stop) => stop.trim())
        .filter(Boolean),
      status: form.status,
    };

    if (editing) {
      updateRoute(editing.id, payload);
      toast.success("Updated successfully");
      setEditing(null);
    } else {
      addRoute(payload);
      toast.success("Added successfully");
    }

    setIsFormOpen(false);
    setForm(emptyForm);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteRoute(deletingId);
    toast.success("Deleted successfully");
    setDeletingId(null);
  };

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
            <th className="px-5 py-4 text-left">Start</th>
            <th className="px-5 py-4 text-left">End</th>
            <th className="px-5 py-4 text-left">Stops</th>
            <th className="px-5 py-4 text-left">Status</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr
              key={route.id}
              className="border-t border-surface-container-high"
            >
              <td className="px-5 py-4 font-semibold">{route.startStation}</td>
              <td className="px-5 py-4 font-semibold">{route.endStation}</td>
              <td className="px-5 py-4 text-on-surface-variant">
                {route.stops.join(", ") || "-"}
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={route.status} />
              </td>
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

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "Edit Route" : "Add Route"}
      >
        {editing ? (
          <div>
            <div className="px-4 py-2">
              <h3 className="text-lg font-bold">Edit Route</h3>
              <p className="text-sm text-on-surface-variant">
                Modify details for Route {editing.id}
              </p>
            </div>
            <div className="border-t border-surface-container-high px-4 py-4">
              <form className="space-y-4" onSubmit={submit}>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Stops
                  </label>
                  <div className="relative">
                    <select
                      value={""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        setForm((prev) => ({
                          ...prev,
                          stops: [
                            ...prev.stops
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                            val,
                          ].join(", "),
                        }));
                      }}
                      className="w-full rounded-lg bg-surface-container-high px-4 py-3 pr-10 text-sm text-on-surface appearance-none"
                    >
                      <option value="">Select stops to add...</option>
                      <option value="Station A">Station A</option>
                      <option value="Hub B">Hub B</option>
                      <option value="Stop C">Stop C</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                      <CirclePlus size={18} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.stops
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((stop) => (
                        <span
                          key={stop}
                          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                        >
                          {stop}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                stops: prev.stops
                                  .split(",")
                                  .map((x) => x.trim())
                                  .filter((x) => x !== stop)
                                  .join(", "),
                              }))
                            }
                            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-primary"
                            aria-label={`Remove ${stop}`}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Status
                  </label>
                  <div className="relative w-full md:w-1/2">
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          status: event.target.value as RouteStatus,
                        }))
                      }
                      className="w-full rounded-lg bg-surface-container-high px-4 py-3 pr-10 text-sm text-on-surface appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-container-high flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-lg bg-surface-container-high px-4 py-2 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6">
            <form className="space-y-6" onSubmit={submit}>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Route Number
                </label>
                <input
                  value={form.routeNumber}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      routeNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g., 138"
                  className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm"
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Start Station
                  </label>
                  <select
                    value={form.startStation}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        startStation: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm"
                  >
                    <option value="">Select start station (A-Z)</option>
                    <option>Colombo</option>
                    <option>Fort</option>
                    <option>Panadura</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    End Station
                  </label>
                  <select
                    value={form.endStation}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        endStation: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm"
                  >
                    <option value="">Select end station (A-Z)</option>
                    <option>Piliyandala</option>
                    <option>Maharagama</option>
                    <option>Pettah</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Stops
                  </label>
                  <div className="relative">
                    <input
                      value={stopsInput}
                      onChange={(e) => setStopsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = stopsInput.trim();
                          if (!val) return;
                          setForm((prev) => ({
                            ...prev,
                            stops: [
                              ...prev.stops
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                              val,
                            ].join(", "),
                          }));
                          setStopsInput("");
                        }
                      }}
                      placeholder="Search bus stops (A-Z)"
                      className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Search size={16} className="text-on-surface-variant" />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.stops
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((stop) => (
                        <span
                          key={stop}
                          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                        >
                          {stop}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                stops: prev.stops
                                  .split(",")
                                  .map((x) => x.trim())
                                  .filter((x) => x !== stop)
                                  .join(", "),
                              }))
                            }
                            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-primary"
                            aria-label={`Remove ${stop}`}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Status
                  </label>
                  <div className="w-48">
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          status: event.target.value as RouteStatus,
                        }))
                      }
                      className="w-full rounded-full bg-surface-container-high px-5 py-3 text-sm appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-surface-container-high flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Save Route
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(deletingRoute)}
        onClose={() => setDeletingId(null)}
        title="Delete Route"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to delete {deletingRoute?.startStation} to{" "}
            {deletingRoute?.endStation}?
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
