// src/layouts/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { SideNav } from "../components/SideNav";

export function AppLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      <SideNav />

      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center px-6">
          <div className="text-sm font-medium text-slate-600">
            MAKINA OPS – Internal Dashboard
          </div>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
