"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "@/lib/store/admin-store";
import type { Driver, DriverStatus } from "@/lib/types";

type AddDriverForm = {
  name: string;
  idNumber: string;
  licenseNumber: string;
  age: string;
  birthdate: string;
  address: string;
  status: DriverStatus;
};

const defaultForm: AddDriverForm = {
  name: "",
  idNumber: "",
  licenseNumber: "",
  age: "",
  birthdate: "",
  address: "",
  status: "Active",
};

export default function DriversPage() {
  const { drivers, addDriver, updateDriverStatus, deleteDriver } =
    useAdminStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [editStatus, setEditStatus] = useState<DriverStatus>("Active");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const deletingDriver = useMemo(
    () => drivers.find((driver) => driver.id === deletingId) || null,
    [drivers, deletingId],
  );

  const openEdit = (driver: Driver) => {
    setEditing(driver);
    setEditStatus(driver.status);
  };

  const submitAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addDriver({
      name: form.name,
      idNumber: form.idNumber,
      licenseNumber: form.licenseNumber,
      age: Number(form.age),
      birthdate: form.birthdate,
      address: form.address,
      status: form.status,
    });
    toast.success("Added successfully");
    setIsAddOpen(false);
    setForm(defaultForm);
  };

  const submitEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) {
      return;
    }

    updateDriverStatus(editing.id, editStatus);
    toast.success("Updated successfully");
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deletingId) {
      return;
    }

    deleteDriver(deletingId);
    toast.success("Deleted successfully");
    setDeletingId(null);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Driver Management
          </h1>
          <p className="text-sm text-on-surface-variant">
            Manage driver lifecycle and availability
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
            <th className="px-5 py-4 text-left">ID Number</th>
            <th className="px-5 py-4 text-left">License</th>
            <th className="px-5 py-4 text-left">Age</th>
            <th className="px-5 py-4 text-left">Status</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr
              key={driver.id}
              className="border-t border-surface-container-high"
            >
              <td className="px-5 py-4 font-semibold">{driver.name}</td>
              <td className="px-5 py-4 text-on-surface-variant">
                {driver.idNumber}
              </td>
              <td className="px-5 py-4 text-on-surface-variant">
                {driver.licenseNumber}
              </td>
              <td className="px-5 py-4 text-on-surface-variant">
                {driver.age}
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={driver.status} />
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(driver)}
                    className="rounded-lg bg-surface-container-high p-2 text-on-surface-variant transition hover:text-primary"
                  >
                    <Pencil size={16} />
                  </button>
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

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Driver"
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitAdd}>
          <label className="text-sm md:col-span-1">
            <span className="mb-2 block font-semibold text-on-surface-variant">
              Name
            </span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label className="text-sm md:col-span-1">
            <span className="mb-2 block font-semibold text-on-surface-variant">
              ID Number
            </span>
            <input
              required
              value={form.idNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, idNumber: event.target.value }))
              }
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label className="text-sm md:col-span-1">
            <span className="mb-2 block font-semibold text-on-surface-variant">
              License Number
            </span>
            <input
              required
              value={form.licenseNumber}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  licenseNumber: event.target.value,
                }))
              }
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label className="text-sm md:col-span-1">
            <span className="mb-2 block font-semibold text-on-surface-variant">
              Age
            </span>
            <input
              required
              type="number"
              min={18}
              value={form.age}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, age: event.target.value }))
              }
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label className="text-sm md:col-span-1">
            <span className="mb-2 block font-semibold text-on-surface-variant">
              Birthdate
            </span>
            <input
              required
              type="date"
              value={form.birthdate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, birthdate: event.target.value }))
              }
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label className="text-sm md:col-span-1">
            <span className="mb-2 block font-semibold text-on-surface-variant">
              Status
            </span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as DriverStatus,
                }))
              }
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="Active">Active</option>
              <option value="On Vacation">On Vacation</option>
            </select>
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-2 block font-semibold text-on-surface-variant">
              Address
            </span>
            <input
              required
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <button
            type="submit"
            className="md:col-span-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white"
          >
            Add Driver
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Driver Status"
      >
        <form className="grid gap-4" onSubmit={submitEdit}>
          <p className="text-sm text-on-surface-variant">{editing?.name}</p>
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-on-surface-variant">
              Status
            </span>
            <select
              value={editStatus}
              onChange={(event) =>
                setEditStatus(event.target.value as DriverStatus)
              }
              className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="Active">Active</option>
              <option value="On Vacation">On Vacation</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white"
          >
            Update Status
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deletingDriver)}
        onClose={() => setDeletingId(null)}
        title="Delete Driver"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Remove driver {deletingDriver?.name} from system?
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
