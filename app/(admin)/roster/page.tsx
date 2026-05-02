"use client";

import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "@/lib/store/admin-store";

export default function RosterPage() {
  const {
    routes,
    buses,
    drivers,
    rosterAssignments,
    assignRoster,
    deleteAssignment,
  } = useAdminStore();

  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<
    string | null
  >(null);

  const assignedBusIds = new Set(
    rosterAssignments.map((assignment) => assignment.busId),
  );
  const assignedDriverIds = new Set(
    rosterAssignments.map((assignment) => assignment.driverId),
  );

  const availableBuses = buses.filter(
    (bus) => bus.status === "Active" && !assignedBusIds.has(bus.id),
  );

  const availableDrivers = drivers.filter(
    (driver) => driver.status === "Active" && !assignedDriverIds.has(driver.id),
  );

  const deletingAssignment = useMemo(
    () =>
      rosterAssignments.find(
        (assignment) => assignment.id === deletingAssignmentId,
      ) || null,
    [rosterAssignments, deletingAssignmentId],
  );

  const handleAssign = () => {
    if (!selectedRouteId || !selectedBusId || !selectedDriverId) {
      toast.error("Please select route, bus and driver");
      return;
    }

    assignRoster(selectedRouteId, selectedBusId, selectedDriverId);
    toast.success("Added successfully");
    setSelectedRouteId("");
    setSelectedBusId("");
    setSelectedDriverId("");
  };

  const confirmDelete = () => {
    if (!deletingAssignmentId) {
      return;
    }

    deleteAssignment(deletingAssignmentId);
    toast.success("Deleted successfully");
    setDeletingAssignmentId(null);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">
          Roster Management
        </h1>
        <p className="text-sm text-on-surface-variant">
          Assign routes, active buses and available drivers
        </p>
      </div>

      <div className="grid gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-soft md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-on-surface-variant">
            Select Route
          </span>
          <select
            value={selectedRouteId}
            onChange={(event) => setSelectedRouteId(event.target.value)}
            className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.startStation}
                {" -> "}
                {route.endStation}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-2 block font-semibold text-on-surface-variant">
            Select Bus
          </span>
          <select
            value={selectedBusId}
            onChange={(event) => setSelectedBusId(event.target.value)}
            className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select bus</option>
            {availableBuses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.busNumber} ({bus.busType})
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-2 block font-semibold text-on-surface-variant">
            Select Driver
          </span>
          <select
            value={selectedDriverId}
            onChange={(event) => setSelectedDriverId(event.target.value)}
            className="w-full rounded-xl bg-surface-container-high px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select driver</option>
            {availableDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleAssign}
          className="self-end rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white"
        >
          Assign
        </button>
      </div>

      <Table>
        <thead>
          <tr className="bg-surface-container-low text-on-surface-variant">
            <th className="px-5 py-4 text-left">Route</th>
            <th className="px-5 py-4 text-left">Bus</th>
            <th className="px-5 py-4 text-left">Driver</th>
            <th className="px-5 py-4 text-left">Status</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rosterAssignments.map((assignment) => {
            const route = routes.find((item) => item.id === assignment.routeId);
            const bus = buses.find((item) => item.id === assignment.busId);
            const driver = drivers.find(
              (item) => item.id === assignment.driverId,
            );

            return (
              <tr
                key={assignment.id}
                className="border-t border-surface-container-high"
              >
                <td className="px-5 py-4 font-semibold">
                  {route
                    ? `${route.startStation} -> ${route.endStation}`
                    : "Route removed"}
                </td>
                <td className="px-5 py-4 text-on-surface-variant">
                  {bus?.busNumber || "Bus removed"}
                </td>
                <td className="px-5 py-4 text-on-surface-variant">
                  {driver?.name || "Driver removed"}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={assignment.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setDeletingAssignmentId(assignment.id)}
                    className="rounded-lg bg-surface-container-high p-2 text-on-surface-variant transition hover:text-error"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal
        isOpen={Boolean(deletingAssignment)}
        onClose={() => setDeletingAssignmentId(null)}
        title="Delete Assignment"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Remove this roster assignment?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeletingAssignmentId(null)}
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
