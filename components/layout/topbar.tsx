"use client";

import { Bell, Menu } from "lucide-react";

type TopbarProps = {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
};

export function Topbar({ onMenuClick, onNotificationsClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-slate-50/80 px-4 backdrop-blur-xl sm:px-8">
      <button
        type="button"
        className="rounded-lg bg-surface-container-high p-2 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          onClick={onNotificationsClick}
          aria-label="Open notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
