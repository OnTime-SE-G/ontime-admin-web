"use client";

import { CalendarClock, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "@/lib/store/admin-store";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type ScheduleForm = {
  route_id: string;
  scheduled_time: string;
  day_of_week: string;
};

const defaultForm: ScheduleForm = { route_id: "", scheduled_time: "", day_of_week: "1" };

export default function SchedulesPage() {
  const { schedules, routes, loadSchedules, loadRoutes, addSchedule } = useAdminStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<ScheduleForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([loadSchedules(), loadRoutes()]);
  }, [loadSchedules, loadRoutes]);

  const routeName = (routeId: number) => {
    const r = routes.find((r) => r.id === String(routeId));
    return r ? `${r.startStation}${r.endStation ? ` → ${r.endStation}` : ""}` : `Route #${routeId}`;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.route_id || !form.scheduled_time) { toast.error("Please fill all fields"); return; }
    setSaving(true);
    try {
      await addSchedule({
        route_id: Number(form.route_id),
        scheduled_time: form.scheduled_time,
        day_of_week: Number(form.day_of_week),
      });
      toast.success("Schedule added");
      setIsAddOpen(false);
      setForm(defaultForm);
    } catch { toast.error("Failed to add schedule"); } finally { setSaving(false); }
  };

  const fieldCls = "w-full rounded-xl bg-surface-container-high px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">Schedules</h1>
          <p className="text-sm text-on-surface-variant mt-1">Define when each route runs during the week</p>
        </div>
        <button type="button" onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:scale-[0.98]">
          <Plus size={16} /> Add Schedule
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-surface-container-lowest shadow-soft gap-3 text-on-surface-variant">
          <CalendarClock size={36} className="opacity-30" />
          <p className="text-sm">No schedules yet. Add one to start planning trips.</p>
        </div>
      ) : (
        <Table>
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant">
              <th className="px-5 py-4 text-left">Route</th>
              <th className="px-5 py-4 text-left">Day</th>
              <th className="px-5 py-4 text-left">Departure Time</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-t border-surface-container-high">
                <td className="px-5 py-4 font-semibold text-on-surface">{routeName(s.routeId)}</td>
                <td className="px-5 py-4 text-on-surface-variant">{DAYS[s.dayOfWeek] ?? `Day ${s.dayOfWeek}`}</td>
                <td className="px-5 py-4 text-on-surface-variant">{s.scheduledTime}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setForm(defaultForm); }} title="Add Schedule">
        <form onSubmit={handleAdd} className="space-y-4 px-1">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Route</label>
            <select required className={fieldCls} value={form.route_id} onChange={(e) => setForm((f) => ({ ...f, route_id: e.target.value }))}>
              <option value="">Select a route...</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.startStation}{r.endStation ? ` → ${r.endStation}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Day of Week</label>
            <select className={fieldCls} value={form.day_of_week} onChange={(e) => setForm((f) => ({ ...f, day_of_week: e.target.value }))}>
              {DAYS.map((day, i) => (
                <option key={day} value={i}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Departure Time</label>
            <input required type="time" className={fieldCls} value={form.scheduled_time} onChange={(e) => setForm((f) => ({ ...f, scheduled_time: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setIsAddOpen(false); setForm(defaultForm); }} className="flex-1 rounded-xl bg-surface-container-high py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? "Saving..." : "Add Schedule"}</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
