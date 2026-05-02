"use client";

import { Bell, CircleHelp, Menu, Search } from "lucide-react";

type TopbarProps = {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
};

export function Topbar({ onMenuClick, onNotificationsClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-slate-50/80 px-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-lg bg-surface-container-high p-2 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h2 className="hidden text-3xl font-semibold text-on-surface sm:block">
          On Time
        </h2>
      </div>

      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm text-on-surface-variant focus-within:ring-2 focus-within:ring-primary/20">
          <Search size={16} />
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Search settings..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          onClick={onNotificationsClick}
          aria-label="Open notifications"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          aria-label="Help"
        >
          <CircleHelp size={18} />
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-container" />
      </div>
    </header>
  );
}
