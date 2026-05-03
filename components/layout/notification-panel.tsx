"use client";

import { Bell, X, CheckCheck, Trash2 } from "lucide-react";
import type { Notification, NotificationSeverity } from "@/lib/socket/notification/notificationTypes";

// ── Severity → left border colour ────────────────────────────────────────────
const SEVERITY_BORDER: Record<NotificationSeverity, string> = {
  info:     "border-l-4 border-blue-400",
  warning:  "border-l-4 border-amber-400",
  critical: "border-l-4 border-red-500",
};

const SEVERITY_DOT: Record<NotificationSeverity, string> = {
  info:     "bg-blue-400",
  warning:  "bg-amber-400",
  critical: "bg-red-500 animate-pulse",
};

// ── Relative time helper ──────────────────────────────────────────────────────
function relativeTime(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── Props ─────────────────────────────────────────────────────────────────────
type NotificationPanelProps = {
  isOpen:        boolean;
  onClose:       () => void;
  notifications: Notification[];
  unreadCount:   number;
  isConnected:   boolean;
  markAsRead:    (id: string) => void;
  markAllAsRead: () => void;
  clearAll:      () => void;
};

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  isConnected,
  markAsRead,
  markAllAsRead,
  clearAll,
}: NotificationPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
          aria-label="Close notifications"
        />
      )}

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-surface-container-lowest shadow-soft transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-surface-container-high px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-on-surface">
            <Bell size={18} />
            Notifications
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </h3>

          <div className="flex items-center gap-1">
            {/* Connection dot */}
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-400"
              }`}
              title={isConnected ? "Live" : "Disconnected"}
            />

            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
              </button>
            )}

            {/* Clear all */}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container-high hover:text-red-500"
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>

        {/* ── List ─────────────────────────────────────────────────────────── */}
        <div className="h-[calc(100%-65px)] overflow-y-auto p-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant">
              <Bell size={32} className="opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => markAsRead(notif.id)}
                  className={`w-full rounded-xl p-4 text-left transition hover:brightness-95
                    ${SEVERITY_BORDER[notif.severity]}
                    ${notif.read
                      ? "bg-surface-container-low opacity-60"
                      : "bg-surface-container-low"
                    }`}
                >
                  {/* Title row */}
                  <div className="mb-1 flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[notif.severity]}`}
                    />
                    <p className={`text-sm leading-snug ${notif.read ? "font-normal text-on-surface-variant" : "font-semibold text-on-surface"}`}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Time */}
                  <p className="ml-4 text-xs text-on-surface-variant">
                    {relativeTime(notif.timestamp)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}