"use client";

import clsx from "clsx";
import {
  Bus,
  CalendarDays,
  Gauge,
  LogOut,
  Route,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/routes", label: "Route Management", icon: Route },
  { href: "/buses", label: "Bus Fleet", icon: Bus },
  { href: "/drivers", label: "Driver Management", icon: User },
  { href: "/roster", label: "Roster Management", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200/60 bg-slate-50 px-4 py-4 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
              <Bus size={14} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-primary">
                On Time
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Transit Authority
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg bg-surface-container-high p-2 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "border-r-2 border-primary bg-blue-50 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200/70 pt-4">
          <Link
            href="/login"
            onClick={onClose}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={18} />
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
