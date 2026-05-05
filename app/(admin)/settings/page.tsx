"use client";

import {
  BellRing,
  Bus,
  Info,
  KeyRound,
  SlidersHorizontal,
  User,
  UserCog,
} from "lucide-react";

const fieldCls = "w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium text-on-surface-variant cursor-default select-none";

export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-5xl font-black tracking-tight text-on-surface">Settings</h1>
        <p className="mt-2 text-sm text-on-surface-variant">System configuration reference</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-surface-container-low border border-outline-variant px-4 py-3 text-sm text-on-surface-variant">
        <Info size={16} className="flex-shrink-0 mt-0.5 text-primary" />
        <p>Configuration is managed via environment variables and server-side config. Values shown here are read-only defaults.</p>
      </div>

      <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-surface-container-low p-2 text-primary"><SlidersHorizontal size={18} /></div>
          <h2 className="text-2xl font-bold text-on-surface">General</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>System Name</span>
            <div className={fieldCls}>On Time</div>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>Default Language</span>
            <div className={fieldCls}>English</div>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>Time Zone</span>
            <div className={fieldCls}>Asia/Colombo</div>
          </label>
        </div>
      </section>

      <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-surface-container-low p-2 text-primary"><BellRing size={18} /></div>
          <h2 className="text-2xl font-bold text-on-surface">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: "Enable System Notifications", desc: "Receive global system alerts and updates.", value: true },
            { label: "Enable Delay Alerts", desc: "Notify admins when a route is experiencing significant delays.", value: true },
            { label: "Enable Driver Alerts", desc: "Send SMS/Push notifications directly to drivers.", value: false },
          ].map(({ label, desc, value }) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-surface-container-low p-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant">{desc}</p>
              </div>
              <div className={`relative h-6 w-11 rounded-full ${value ? "bg-primary/40" : "bg-surface-container-highest"} cursor-default`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white/70 ${value ? "right-1" : "left-1"}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-surface-container-low p-2 text-primary"><Bus size={18} /></div>
            <h2 className="text-2xl font-bold text-on-surface">Bus Configuration</h2>
          </div>
          <div className="space-y-4">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              <span>Default Bus Status</span>
              <div className={fieldCls}>Active</div>
            </label>
            <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              <span>Max Seat Capacity</span>
              <div className={fieldCls}>54</div>
            </label>
          </div>
        </section>

        <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-surface-container-low p-2 text-primary"><User size={18} /></div>
            <h2 className="text-2xl font-bold text-on-surface">Driver Settings</h2>
          </div>
          <div className="space-y-4">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              <span>Default Driver Status</span>
              <div className={fieldCls}>Active</div>
            </label>
            <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              <span>Minimum Driver Age</span>
              <div className={fieldCls}>25</div>
            </label>
          </div>
        </section>
      </div>

      <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-surface-container-low p-2 text-primary"><UserCog size={18} /></div>
          <h2 className="text-2xl font-bold text-on-surface">Admin Account</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>Admin Name</span>
            <div className={fieldCls}>System Administrator</div>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>Email Address</span>
            <div className={fieldCls}>admin@ontime.transit.gov</div>
          </label>
          <div className="md:col-span-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant opacity-50 cursor-not-allowed"
            >
              <KeyRound size={16} />
              Change Password
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
