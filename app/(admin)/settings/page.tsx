import {
  BellRing,
  Bus,
  KeyRound,
  SlidersHorizontal,
  User,
  UserCog,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-on-surface">
            Settings
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Manage system preferences and configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface"
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            Save Changes
          </button>
        </div>
      </div>

      <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-surface-container-low p-2 text-primary">
            <SlidersHorizontal size={18} />
          </div>
          <h2 className="text-2xl font-bold text-on-surface">
            General Settings
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>System Name</span>
            <input
              defaultValue="On Time"
              className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>Default Language</span>
            <select className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20">
              <option>English</option>
              <option>Sinhala</option>
              <option>Tamil</option>
            </select>
          </label>

          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant md:col-span-1">
            <span>Time Zone</span>
            <select className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20">
              <option>Asia/Colombo</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-surface-container-low p-2 text-primary">
            <BellRing size={18} />
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Notifications</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-4">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Enable System Notifications
              </p>
              <p className="text-xs text-on-surface-variant">
                Receive global system alerts and updates.
              </p>
            </div>
            <button
              type="button"
              aria-label="Enable System Notifications"
              className="relative h-6 w-11 rounded-full bg-primary"
            >
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-4">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Enable Delay Alerts
              </p>
              <p className="text-xs text-on-surface-variant">
                Notify admins when a route is experiencing significant delays.
              </p>
            </div>
            <button
              type="button"
              aria-label="Enable Delay Alerts"
              className="relative h-6 w-11 rounded-full bg-primary"
            >
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-4">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Enable Driver Alerts
              </p>
              <p className="text-xs text-on-surface-variant">
                Send SMS/Push notifications directly to drivers.
              </p>
            </div>
            <button
              type="button"
              aria-label="Enable Driver Alerts"
              className="relative h-6 w-11 rounded-full bg-surface-container-highest"
            >
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-surface-container-low p-2 text-primary">
              <Bus size={18} />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">
              Bus Configuration
            </h2>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              <span>Default Bus Status</span>
              <select className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20">
                <option>Active</option>
                <option>Maintenance</option>
              </select>
            </label>

            <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              <span>Max Seat Capacity</span>
              <input
                type="number"
                defaultValue={54}
                className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-surface-container-low p-2 text-primary">
              <User size={18} />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">
              Driver Settings
            </h2>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              <span>Default Driver Status</span>
              <select className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20">
                <option>Active</option>
                <option>On Vacation</option>
              </select>
            </label>

            <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              <span>Minimum Driver Age</span>
              <input
                type="number"
                defaultValue={25}
                className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        </section>
      </div>

      <section className="rounded-xl border-l border-primary/40 bg-surface-container-lowest p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-surface-container-low p-2 text-primary">
            <UserCog size={18} />
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Admin Account</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>Admin Name</span>
            <input
              defaultValue="System Administrator"
              className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>Email Address</span>
            <input
              type="email"
              defaultValue="admin@ontime.transit.gov"
              className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium normal-case text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface"
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
