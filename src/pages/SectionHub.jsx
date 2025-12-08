// src/pages/SectionHub.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { getSectionById } from "../config/navigation";

export function SectionHub() {
  const { sectionId } = useParams();
  const section = getSectionById(sectionId);

  if (!section) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Section not found</h1>
        <p className="text-sm text-slate-500">
          No section found for ID <code>{sectionId}</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <p className="text-sm text-slate-500">{section.description}</p>
      </header>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {section.modules.map((mod) => (
          <Link
            key={mod.id}
            to={mod.path}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold group-hover:text-slate-900">
                {mod.label}
              </h2>
              <p className="text-xs text-slate-500">
                Click to open {mod.label}.
              </p>
            </div>
            <div className="mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-500">
              Open →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
