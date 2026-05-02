"use client";

import { useState } from "react";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationsClick={() => setNotificationsOpen(true)}
        />
        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
