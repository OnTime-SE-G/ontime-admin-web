"use client";

import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "@/lib/store/admin-store";
import type { Driver } from "@/lib/types";

type AddDriverForm = {
  name: string;
  licenseNumber: string;
  phone: string;
};

const defaultForm: AddDriverForm = { name: "", licenseNumber: "", phone: "" };

export default function DriversPage() {
  const { drivers, addDriver, loadDrivers } = useAdminStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  const deletingDriver = useMemo(
    () => drivers.find((d) => d.id === deletingId) || null,
    [drivers, deletingId],
  );

  const submitAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await addDriver({
        name: form.name,
        license_number: form.licenseNumber,
        phone: form.phone || undefined,
      });
      toast.success("Driver added");
      setIsAddOpen(false);
      setForm(defaultForm);
    } catch {
      toast.error("Failed to add driver");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = () => {
    // Backend has no DELETE /drivers endpoint — show info toast
    toast("Driver removal is not supported by the backend yet.", { icon: "ℹ️" });
    setDeletingId(null);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Driver Management</h1>
          <p className="text-sm text-on-surface-variant">
            Manage driver records
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Add Driver
        </button>
      </div>

      <Table>
        <thead>
          <tr className="bg-surface-container-low text-on-surface-variant">
            <th className="px-5 py-4 text-left">Name</th>
            <th className="px-5 py-4 text-left">License Number</th>
            <th className="px-5 py-4 text-left">Phone</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver: Driver) => (
            <tr key={driver.id} className="border-t border-surface-container-high">
              <td className="px-5 py-4 font-semibold">{driver.name}</td>
              <td className="px-5 py-4 text-on-surface-variant">{driver.licenseNumber}</td>
              <td className="px-5 py-4 text-on-surface-variant">{driver.phone || "—"}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeletingId(driver.id)}
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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Driver">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitAdd}>
          <label className="text-sm md:col-span-2">
            <span className="mb-2 block font-semibold text-on-surface-variant">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-on-surface-variant">License Number</span>
            <input
              required
              value={form.licenseNumber}
              onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-on-surface-variant">Phone (optional)</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Driver"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={Boolean(deletingDriver)} onClose={() => setDeletingId(null)} title="Remove Driver">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Remove {deletingDriver?.name}?
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
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
