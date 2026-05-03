"use client";

import {
  AlertCircle,
  ArrowUpDown,
  Bus as BusIcon,
  CheckCircle2,
  ChevronDown,
  Edit,
  Filter,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useAdminStore } from "@/lib/store/admin-store";
import { useDashboardSocket } from "@/app/hooks/useDashboardSocket";
import type { Bus, BusStatus } from "@/lib/types";

type AddBusForm = {
  busNumber: string;
  busType: string;
  status: BusStatus;
  seatCapacity: string;
};

const defaultForm: AddBusForm = {
  busNumber: "",
  busType: "",
  status: "Active",
  seatCapacity: "",
};

export default function BusesPage() {
  const { buses, addBus, updateBusStatus, deleteBus } = useAdminStore();
  const { stats } = useDashboardSocket();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Bus | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [editStatus, setEditStatus] = useState<BusStatus>("Active");

  const deletingBus = useMemo(
    () => buses.find((bus) => bus.id === deletingId) || null,
    [buses, deletingId],
  );

  const openEdit = (bus: Bus) => {
    setEditing(bus);
    setEditStatus(bus.status);
  };

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.busNumber || !form.busType || !form.seatCapacity) {
      toast.error("Please fill all fields");
      return;
    }
    addBus({
      busNumber: form.busNumber,
      busType: form.busType,
      status: form.status,
      seatCapacity: Number(form.seatCapacity),
    });
    toast.success("Bus added successfully");
    setIsAddOpen(false);
    setForm(defaultForm);
  };

  const handleEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) {
      return;
    }

    updateBusStatus(editing.id, editStatus);
    toast.success("Bus status updated successfully");
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deletingId) {
      return;
    }

    deleteBus(deletingId);
    toast.success("Bus deleted successfully");
    setDeletingId(null);
  };

  const busTypeOptions = [
    "Volvo 9700",
    "Scania K310",
    "Yutong ZK6122",
    "Ashok Leyland",
    "Toyota Coaster",
  ];

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black tracking-tight text-on-surface">
            Manage Buses
          </h1>
          <p className="text-on-surface-variant text-base mt-2">
            Oversee active fleet, maintenance schedules, and route assignments
            in real-time.
          </p>
          <p className="text-xs text-on-surface-variant mt-3">
            Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-primary to-primary-container px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[0.98]"
        >
          <Plus size={18} /> Add Bus
        </button>
      </div>

      {/* Stat Cards - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Fleet */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <BusIcon size={18} className="text-primary" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Total Fleet
            </span>
          </div>
          <div className="text-4xl font-black text-on-surface">
            {stats.totalBuses}
          </div>
        </div>

        {/* Active Currently - Clickable Link */}
        <Link
          href="/buses/active"
          className="rounded-xl bg-surface-container-lowest p-6 shadow-soft relative overflow-hidden hover:bg-surface-container-low transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Active Currently
            </span>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-black text-on-surface">
              {stats.activeBuses}
            </div>
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View live active buses →
          </p>
        </Link>

        {/* In Maintenance */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <Wrench size={18} className="text-amber-600" />
            <span className="text-sm font-medium uppercase tracking-wider">
              In Maintenance
            </span>
          </div>
          <div className="text-4xl font-black text-on-surface">
            {stats.busesInMaintenance}
          </div>
        </div>
      </div>

      {/* Fleet Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg font-bold text-on-surface">Fleet Roster</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container transition-colors">
              <Filter size={16} />
            </button>
            <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container transition-colors">
              <ArrowUpDown size={16} />
            </button>
          </div>
        </div>

        {/* Bus List */}
        <div className="space-y-3">
          {buses.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-lowest rounded-xl">
              <p className="text-on-surface-variant">
                No buses found. Add a bus to get started.
              </p>
            </div>
          ) : (
            buses.map((bus) => (
              <div
                key={bus.id}
                className="bg-surface-container-lowest rounded-xl p-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-surface-container-lowest/80 border border-transparent hover:border-primary/5"
              >
                {/* Bus Identity */}
                <div className="flex items-center gap-4 md:w-1/4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                    <BusIcon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-on-surface">
                      {bus.busNumber}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      {bus.busType}
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="md:w-1/4 flex items-center">
                  <div className="text-sm text-on-surface-variant">
                    <span className="font-semibold text-on-surface">
                      {bus.seatCapacity}
                    </span>{" "}
                    seats
                  </div>
                </div>

                {/* Status */}
                <div className="md:w-1/4 flex items-center">
                  {bus.status === "Active" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                      <Wrench size={14} />
                      Maintenance
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end md:w-auto">
                  <button
                    onClick={() => openEdit(bus)}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => setDeletingId(bus.id)}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Bus Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Bus"
      >
        <div className="px-6 py-2">
          <p className="text-sm text-on-surface-variant">
            Register a new asset to the fleet roster.
          </p>
        </div>
        <div className="border-t border-surface-container-high px-6 py-6">
          <form className="space-y-6" onSubmit={handleAdd}>
            {/* Bus Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface">
                Bus Number
              </label>
              <input
                type="text"
                required
                value={form.busNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, busNumber: e.target.value }))
                }
                placeholder="e.g. BUS-990"
                className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-colors placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Bus Type and Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-on-surface">
                  Manufacturer / Type
                </label>
                <div className="relative">
                  <select
                    value={form.busType}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, busType: e.target.value }))
                    }
                    className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Select type...
                    </option>
                    {busTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-on-surface">
                  Seat Capacity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.seatCapacity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seatCapacity: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-colors placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Initial Status */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-on-surface">
                Initial Status
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={form.status === "Active"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as BusStatus,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border border-transparent peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-800 transition-all flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="font-medium text-sm">Active</span>
                  </div>
                </label>

                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Maintenance"
                    checked={form.status === "Maintenance"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as BusStatus,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border border-transparent peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-800 transition-all flex items-center gap-3">
                    <Wrench size={16} className="text-amber-500" />
                    <span className="font-medium text-sm">Maintenance</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-surface-container-high flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg bg-surface-container-high px-6 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-linear-to-br from-primary to-primary-container px-6 py-2 text-sm font-semibold text-white hover:scale-[0.98] transition-transform"
              >
                Add Bus
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Bus Status Modal */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Bus Status"
      >
        <div className="px-6 py-2">
          <p className="text-sm text-on-surface-variant">
            Update operational status for this vehicle.
          </p>
        </div>
        <div className="border-t border-surface-container-high px-6 py-6">
          <form className="space-y-6" onSubmit={handleEdit}>
            {/* Bus Number - Read Only */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant">
                BUS NUMBER
              </label>
              <div className="rounded-xl bg-surface-container-high px-4 py-3 text-on-surface font-medium">
                {editing?.busNumber}
              </div>
            </div>

            {/* Current Route - Read Only */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant">
                CURRENT ROUTE
              </label>
              <div className="rounded-xl bg-surface-container-high px-4 py-3 text-on-surface-variant italic">
                Route assignment pending
              </div>
            </div>

            {/* Operational Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface">
                OPERATIONAL STATUS
              </label>
              <div className="relative">
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as BusStatus)}
                  className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-colors appearance-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
              </div>
            </div>

            {/* Maintenance Note */}
            {editStatus === "Maintenance" && (
              <div className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle
                  size={20}
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <p className="text-sm text-amber-800">
                  Vehicle is currently undergoing maintenance. It will not be
                  assigned to any routes.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-4 border-t border-surface-container-high flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg bg-surface-container-high px-6 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-linear-to-br from-primary to-primary-container px-6 py-2 text-sm font-semibold text-white hover:scale-[0.98] transition-transform"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingBus)}
        onClose={() => setDeletingId(null)}
        title="Delete Bus"
      >
        <div className="px-6 py-6 space-y-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <AlertCircle className="w-6 h-6 text-error mt-0.5" />
            </div>
            <div>
              <h3 className="font-semibold text-on-surface mb-2">
                Delete Bus?
              </h3>
              <p className="text-sm text-on-surface-variant">
                Are you sure you want to delete bus{" "}
                <span className="font-semibold text-on-surface">
                  {deletingBus?.busNumber}
                </span>
                ? This action cannot be undone and will remove it from all
                active rosters.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container-high flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="rounded-lg bg-surface-container-high px-6 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-error px-6 py-2 text-sm font-semibold text-white hover:scale-[0.98] transition-transform"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
