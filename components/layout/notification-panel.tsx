import { Bell, BellOff } from "lucide-react";

type NotificationPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-label="Close notifications"
      />
      <div className="fixed right-4 top-[4.5rem] z-50 w-80 rounded-2xl bg-surface-container-lowest shadow-lg border border-outline-variant overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
          <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <Bell size={15} /> Notifications
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-on-surface-variant">
          <BellOff size={28} className="opacity-30" />
          <p className="text-xs">No notifications</p>
        </div>
      </div>
    </>
  );
}
