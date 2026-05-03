"use client";

import Link from "next/link";
// import { useAdminStore } from "@/lib/store/admin-store";
import { useDashboardSocket } from "@/app/hooks/useDashboardSocket";
import { Wifi, WifiOff } from "lucide-react";

export default function DashboardPage() {
  const { stats, isConnected, isLoading } = useDashboardSocket();
  // const { routes, buses, drivers } = useAdminStore();

  const metrics = [
    { label: "Total Routes",     value: stats.totalRoutes     },
    { label: "Total Buses",      value: stats.totalBuses      },
    { label: "Active Buses",     value: stats.activeBuses     },
    { label: "Assigned Drivers", value: stats.assignedDrivers },
  ];

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">
            Overview
          </h1>
          <p className="text-sm text-on-surface-variant">
            {isConnected
              ? `Live · updated ${new Date(stats.lastUpdated).toLocaleTimeString()}`
              : "Real-time transit system diagnostics"}
          </p>
        </div>

        {/* Connection badge */}
        <div
          className={`flex items-center gap-2 self-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            isConnected
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isConnected
            ? <Wifi    className="h-4 w-4" />
            : <WifiOff className="h-4 w-4" />}
          {isConnected ? "Live" : "Disconnected"}
          {isConnected && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          )}
        </div>
      </div>

      {/* Stat Cards — socket driven */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-xl bg-surface-container-lowest p-6 shadow-soft"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
              {metric.label}
            </p>
            {isLoading ? (
              <div className="mt-5 h-10 w-16 animate-pulse rounded-lg bg-surface-container-high" />
            ) : (
              <p className="mt-5 text-4xl font-black tabular-nums text-on-surface">
                {metric.value}
              </p>
            )}
          </article>
        ))}
      </div>

      {/* Bottom sections — store driven, unchanged */}
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
              className="rounded-xl bg-linear-to-br from-primary to-primary-container px-4 py-2 text-sm font-semibold text-white transition hover:scale-[0.98]"
            >
              View Active Buses
            </Link>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-soft">
          <h4 className="text-lg font-bold">Operations Pulse</h4>
          <div className="mt-4 space-y-3 text-sm">
            {isLoading ? (
              <>
                <div className="h-6 w-24 animate-pulse rounded-lg bg-surface-container-high" />
                <div className="h-6 w-24 animate-pulse rounded-lg bg-surface-container-high" />
                <div className="h-6 w-24 animate-pulse rounded-lg bg-surface-container-high" />
              </>
            ) : (
              <>
                <div className="rounded-lg bg-surface-container-low p-3">
                  {stats.driversOnboard} drivers onboard
                </div>
                <div className="rounded-lg bg-surface-container-low p-3">
                  {stats.activeRoutes} active routes
                </div>
                <div className="rounded-lg bg-surface-container-low p-3">
                  {stats.busesInMaintenance} buses in
                  maintenance
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}