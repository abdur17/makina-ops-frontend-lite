// src/components/SideNav.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sections } from "../config/navigation";
import { useAuthStore } from "../store/authStore";

function classNames(...args) {
  return args.filter(Boolean).join(" ");
}

export function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const pathname = location.pathname;

  // A section is active if:
  // - We're on its hub (/section/:id), OR
  // - We're on any of its module paths (e.g. /customers/users)
  const isSectionActive = (section) => {
    if (pathname === `/section/${section.id}`) return true;

    if (section.modules && section.modules.length > 0) {
      return section.modules.some((m) => pathname.startsWith(m.path));
    }

    return false;
  };

  const handleSectionClick = (sectionId) => {
    navigate(`/section/${sectionId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-50 border-r border-slate-800 flex flex-col">
      {/* Brand */}
      <div className="h-16 px-4 flex items-center border-b border-slate-800">
        <div className="font-semibold tracking-wide">
          MAKINA OPS <span className="text-xs opacity-70">Lite</span>
        </div>
      </div>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {sections.map((section) => {
          const active = isSectionActive(section);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSectionClick(section.id)}
              className={classNames(
                "w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors border-l-2",
                active
                  ? "bg-slate-900 text-slate-50 border-sky-400"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white border-transparent"
              )}
            >
              <span className="truncate">{section.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom strip: system label + logout */}
      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Internal System</span>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center rounded-lg border border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
