"use client";

import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "@/lib/store/admin-store";
import type { Driver } from "@/lib/types";

type AddDriverForm = { name: string; licenseNumber: string; phone: string; password: string; confirmPassword: string };
const defaultForm: AddDriverForm = { name: "", licenseNumber: "", phone: "", password: "", confirmPassword: "" };

export default function DriversPage() {
  const { drivers, addDriver, deleteDriver, loadDrivers } = useAdminStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  const deletingDriver = useMemo(() => drivers.find((d) => d.id === deletingId) ?? null, [drivers, deletingId]);

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    setSubmitting(true);
    try {
      await addDriver({ name: form.name, license_number: form.licenseNumber, phone: form.phone || undefined });
      toast.success("Driver added");
      setIsAddOpen(false);
      setForm(defaultForm);
    } catch { toast.error("Failed to add driver"); } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteDriver(deletingId);
      toast.success("Driver removed");
    } catch { toast.error("Failed to remove driver"); } finally { setDeleting(false); setDeletingId(null); }
  };

  const inputCls = "w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Driver Management</h1>
          <p className="text-sm text-on-surface-variant">Manage driver records</p>
        </div>
        <button type="button" onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white">
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
          {drivers.length === 0 ? (
            <tr><td colSpan={4} className="px-5 py-12 text-center text-on-surface-variant">No drivers found. Add one to get started.</td></tr>
          ) : drivers.map((driver: Driver) => (
            <tr key={driver.id} className="border-t border-surface-container-high">
              <td className="px-5 py-4 font-semibold">{driver.name}</td>
              <td className="px-5 py-4 text-on-surface-variant">{driver.licenseNumber}</td>
              <td className="px-5 py-4 text-on-surface-variant">{driver.phone || "—"}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setDeletingId(driver.id)} className="rounded-lg bg-surface-container-high p-2 text-on-surface-variant transition hover:text-error"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setForm(defaultForm); }} title="Add Driver">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitAdd}>
          <label className="text-sm md:col-span-2">
            <span className="mb-2 block font-semibold text-on-surface-variant">Name</span>
            <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-on-surface-variant">License Number</span>
            <input required value={form.licenseNumber} onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))} className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-on-surface-variant">Phone (optional)</span>
            <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-on-surface-variant">Password</span>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={inputCls + " pr-10"} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-on-surface-variant">Confirm Password</span>
            <div className="relative">
              <input required type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} className={inputCls + " pr-10"} />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>
          <button type="submit" disabled={submitting} className="md:col-span-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {submitting ? "Adding..." : "Add Driver"}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deletingDriver} onClose={() => setDeletingId(null)} title="Remove Driver">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">Remove <span className="font-semibold text-on-surface">{deletingDriver?.name}</span>? This cannot be undone.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDeletingId(null)} className="flex-1 rounded-xl bg-surface-container-high px-4 py-2 text-sm font-semibold">Cancel</button>
            <button type="button" onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-xl bg-error px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{deleting ? "Removing..." : "Remove"}</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
