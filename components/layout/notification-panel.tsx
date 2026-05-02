import { Bell, Bus, Route, UserCircle2 } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Bus OT-1088 marked for maintenance",
    time: "2m ago",
    icon: Bus,
  },
  {
    id: 2,
    title: "Route Colombo -> Piliyandala updated",
    time: "12m ago",
    icon: Route,
  },
  {
    id: 3,
    title: "Driver Nimal Silva on vacation",
    time: "25m ago",
    icon: UserCircle2,
  },
];

type NotificationPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
          aria-label="Close notifications"
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-surface-container-lowest p-6 shadow-soft transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-on-surface">
            <Bell size={18} /> Notifications
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-semibold"
          >
            Close
          </button>
        </div>
        <div className="space-y-3">
          {notifications.map(({ id, icon: Icon, title, time }) => (
            <div key={id} className="rounded-xl bg-surface-container-low p-4">
              <div className="mb-1 flex items-center gap-2 text-on-surface">
                <Icon size={15} />
                <p className="text-sm font-semibold">{title}</p>
              </div>
              <p className="text-xs text-on-surface-variant">{time}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
