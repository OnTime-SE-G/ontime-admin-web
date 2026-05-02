"use client";

import { Bus, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { LiveMap } from "@/components/map/live-map";
import { Modal } from "@/components/ui/modal";
import { useAdminStore } from "@/lib/store/admin-store";

export default function ActiveBusesPage() {
  const { buses, routes, drivers, rosterAssignments } = useAdminStore();
  const [mapAssignmentId, setMapAssignmentId] = useState<string | null>(null);

  const activeAssignments = useMemo(
    () =>
      rosterAssignments
        .map((assignment) => {
          const bus = buses.find((item) => item.id === assignment.busId);
          const route = routes.find((item) => item.id === assignment.routeId);
          const driver = drivers.find(
            (item) => item.id === assignment.driverId,
          );

          if (!bus || !route || !driver || bus.status !== "Active") {
            return null;
          }

          return {
            assignmentId: assignment.id,
            busNumber: bus.busNumber,
            routeLabel: `${route.startStation} → ${route.endStation}`,
            startStation: route.startStation,
            endStation: route.endStation,
            driverName: driver.name,
          };
        })
        .filter(Boolean),
    [rosterAssignments, buses, routes, drivers],
  );

  const selected = activeAssignments.find(
    (assignment) => assignment?.assignmentId === mapAssignmentId,
  );

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-on-surface">
          Active Buses
        </h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Real-time status of deployed fleet.
        </p>
      </div>

      {/* Table Section */}
      <div className="rounded-xl bg-surface-container-lowest shadow-soft overflow-hidden">
        {activeAssignments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-on-surface-variant">
              No active bus assignments available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-container-high bg-surface-container-low">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                    Bus ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                    Route & Destination
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                    Assigned Driver
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeAssignments.map((assignment) => {
                  if (!assignment) {
                    return null;
                  }

                  return (
                    <tr
                      key={assignment.assignmentId}
                      className="border-b border-surface-container-high hover:bg-surface-container-low/50 transition-colors"
                    >
                      {/* Bus ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                            <Bus size={16} />
                          </div>
                          <span className="font-semibold text-on-surface">
                            #{assignment.busNumber}
                          </span>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="inline-flex items-center justify-center w-fit px-2 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold font-mono mb-2">
                            {assignment.startStation.substring(0, 1)}
                          </span>
                          <span className="text-sm text-on-surface-variant">
                            {assignment.routeLabel}
                          </span>
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            {assignment.driverName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-on-surface">
                            {assignment.driverName}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          In Transit
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setMapAssignmentId(assignment.assignmentId)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high text-primary hover:bg-primary/10 transition-colors font-medium text-sm"
                        >
                          <MapPin size={16} />
                          View Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Map Modal */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setMapAssignmentId(null)}
        title={
          selected ? `${selected.busNumber} - Live Tracking` : "Live Tracking"
        }
      >
        <div className="w-full h-[600px]">
          {selected && <LiveMap routeLabel={selected.routeLabel} />}
        </div>
      </Modal>
    </section>
  );
}
