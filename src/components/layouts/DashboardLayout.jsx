// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import { SideNav } from "../components/layout/SideNav";

export function DashboardLayout() {
  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-50">
      {/* Left sidebar */}
      <SideNav />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar (simple for now) */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          {/* later: user menu, breadcrumbs, etc. */}
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
