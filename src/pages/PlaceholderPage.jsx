// src/pages/PlaceholderPage.jsx
import React from "react";
import { useLocation } from "react-router-dom";

// Named export: matches `import { PlaceholderPage } from ...`
export function PlaceholderPage({ title }) {
  const location = useLocation();

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-slate-500">
        This is a placeholder page for <strong>{title}</strong>. The full UI
        and integration will be added later.
      </p>
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500">
        <div className="font-mono">Route: {location.pathname}</div>
      </div>
    </div>
  );
}
