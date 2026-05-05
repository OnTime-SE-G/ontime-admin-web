"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useAdminStore } from "@/lib/store/admin-store";

export default function DashboardPage() {
  const { routes, buses, drivers, loadRoutes, loadBuses, loadDrivers } = useAdminStore();

  useEffect(() => {
    void Promise.all([loadRoutes(), loadBuses(), loadDrivers()]);
  }, [loadRoutes, loadBuses, loadDrivers]);

  const metrics = useMemo(
    () => [
      { label: "Total Routes", value: routes.length },
      { label: "Total Buses", value: buses.length },
      {
        label: "Active Buses",
        value: buses.filter((bus) => bus.status === "Active").length,
      },
      {
        label: "Total Drivers",
        value: drivers.length,
      },
    ],
    [routes, buses, drivers],
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-on-surface">
          Overview
        </h1>
        <p className="text-sm text-on-surface-variant">
          Real-time transit system diagnostics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-xl bg-surface-container-lowest p-6 shadow-soft"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
              {metric.label}
            </p>
            <p className="mt-5 text-4xl font-black text-on-surface">
              {metric.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-soft">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <h3 className="text-2xl font-bold tracking-tight">
            Live Distribution
          </h3>
          <p className="text-sm text-on-surface-variant">
            Monitor buses currently in transit
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/buses"
              className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-semibold transition hover:bg-surface-container"
            >
              Manage Fleet
            </Link>
            <Link
              href="/buses/active"
              className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-semibold text-white transition hover:scale-[0.98]"
            >
              View Active Buses
            </Link>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-soft">
          <h4 className="text-lg font-bold">Operations Pulse</h4>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg bg-surface-container-low p-3">
              {drivers.length} drivers onboard
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              {routes.filter((route) => route.status === "Active").length}{" "}
              active routes
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              {buses.filter((bus) => bus.status === "Maintenance").length} buses
              in maintenance
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
