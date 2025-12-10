// src/pages/operations/OperationsSitesPage.jsx
import React, { useEffect, useState } from "react";
import { sitesApi } from "../../api/sitesApi";
import { useAuthStore } from "../../store/authStore";

const TYPE_LABELS = {
  QUARRY: "Quarry",
  SAND_PIT: "Sand Pit",
  LOAM_PIT: "Loam Pit",
  WHARF: "Wharf",
  PROJECT_SITE: "Project Site",
};

const TYPE_BADGES = {
  QUARRY: "bg-sky-50 text-sky-700 border-sky-100",
  SAND_PIT: "bg-amber-50 text-amber-700 border-amber-100",
  LOAM_PIT: "bg-lime-50 text-lime-700 border-lime-100",
  WHARF: "bg-indigo-50 text-indigo-700 border-indigo-100",
  PROJECT_SITE: "bg-slate-50 text-slate-700 border-slate-100",
};

function statusBadgeClasses(isActive) {
  if (isActive) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  return "bg-slate-50 text-slate-500 border-slate-100";
}

export function OperationsSitesPage() {
  const { user: currentUser } = useAuthStore();

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterActive, setFilterActive] = useState("true");

  const [mode, setMode] = useState(null); // "create" | "edit" | "view" | null
  const [selectedSite, setSelectedSite] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "QUARRY",
    isSupplierSite: false,
    isActive: true,
    address: "",
    latitude: "",
    longitude: "",
    notes: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      type: "QUARRY",
      isSupplierSite: false,
      isActive: true,
      address: "",
      latitude: "",
      longitude: "",
      notes: "",
    });
  };

  const openCreate = () => {
    resetForm();
    setSelectedSite(null);
    setMode("create");
    setError(null);
  };

  const openView = (site) => {
    setSelectedSite(site);
    setMode("view");
    setError(null);
  };

  const openEdit = (site) => {
    setSelectedSite(site);
    setForm({
      name: site.name || "",
      code: site.code || "",
      type: site.type || "QUARRY",
      isSupplierSite: !!site.isSupplierSite,
      isActive: site.isActive ?? true,
      address: site.address || "",
      latitude:
        typeof site.latitude === "number" ? String(site.latitude) : "",
      longitude:
        typeof site.longitude === "number" ? String(site.longitude) : "",
      notes: site.notes || "",
    });
    setMode("edit");
    setError(null);
  };

  const closePanel = () => {
    setMode(null);
    setSelectedSite(null);
    resetForm();
    setError(null);
  };

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filterType !== "all" && filterType) {
        params.type = filterType;
      }
      if (filterSupplier !== "all") {
        params.isSupplierSite = filterSupplier;
      }
      if (filterActive !== "all") {
        params.isActive = filterActive;
      }

      const data = await sitesApi.list(params);
      const list = data.items || data || [];
      setSites(list);
    } catch (err) {
      console.error("Failed to load sites", err);
      console.log("Response data:", err.response?.data);
      setError("Failed to load sites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterSupplier, filterActive]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      code: form.code || undefined,
      type: form.type,
      isSupplierSite: !!form.isSupplierSite,
      isActive: !!form.isActive,
      address: form.address || undefined,
      latitude:
        form.latitude !== "" ? Number(form.latitude) : undefined,
      longitude:
        form.longitude !== "" ? Number(form.longitude) : undefined,
      notes: form.notes || undefined,
    };

    try {
      if (mode === "create") {
        await sitesApi.create(payload);
      } else if (mode === "edit" && selectedSite?.id) {
        await sitesApi.update(selectedSite.id, payload);
      }
      await loadSites();
      closePanel();
    } catch (err) {
      console.error("Failed to save site", err);
      console.log("Response data:", err.response?.data);
      setError(
        "Failed to save site. Please check inputs (name, type, code) and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (site) => {
    try {
      await sitesApi.update(site.id, { isActive: !site.isActive });
      await loadSites();
      if (selectedSite?.id === site.id) {
        setSelectedSite((prev) =>
          prev ? { ...prev, isActive: !site.isActive } : prev
        );
      }
    } catch (err) {
      console.error("Failed to toggle site active", err);
      setError("Failed to update site status.");
    }
  };

  const handleDelete = async (siteId) => {
    if (!window.confirm("Delete this site? This cannot be undone.")) return;
    try {
      await sitesApi.remove(siteId);
      await loadSites();
      if (selectedSite?.id === siteId) closePanel();
    } catch (err) {
      console.error("Failed to delete site", err);
      setError("Failed to delete site.");
    }
  };

  const filteredSites = sites; // server-side filtering already applied

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sites
          </h1>
          <p className="text-sm text-slate-500">
            Manage quarries, pits, wharves and project sites used across
            voyages and orders.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-800 border border-slate-700"
        >
          + New Site
        </button>
      </header>

      {/* Current user strip */}
      {currentUser && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-700">
              Signed in as:
            </span>{" "}
            {currentUser.fullName || currentUser.name || currentUser.email}
          </div>
          {currentUser.role && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              Role: {currentUser.role}
            </span>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
          >
            <option value="all">All</option>
            <option value="QUARRY">Quarry</option>
            <option value="SAND_PIT">Sand Pit</option>
            <option value="LOAM_PIT">Loam Pit</option>
            <option value="WHARF">Wharf</option>
            <option value="PROJECT_SITE">Project Site</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Supplier Sites:</span>
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
          >
            <option value="all">All</option>
            <option value="true">Supplier Sites Only</option>
            <option value="false">Non-supplier Sites</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Status:</span>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
          >
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
            <option value="all">All</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Sites table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">
            Sites ({filteredSites.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">
              Loading sites...
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No sites found. Create a site to get started.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Supplier Site</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map((site) => {
                  const typeClass =
                    TYPE_BADGES[site.type] ||
                    "bg-slate-50 text-slate-700 border-slate-100";

                  return (
                    <tr key={site.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-800">
                        {site.name}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {site.code || "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${typeClass}`}
                        >
                          {TYPE_LABELS[site.type] || site.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {site.isSupplierSite ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-100">
                            Supplier Site
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border bg-slate-50 text-slate-500 border-slate-100">
                            Internal Site
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border " +
                            statusBadgeClasses(site.isActive)
                          }
                        >
                          {site.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {site.address
                          ? site.address
                          : site.latitude && site.longitude
                          ? `${site.latitude}, ${site.longitude}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => openView(site)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(site)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(site)}
                            className={`px-2 py-1 rounded-lg border text-xs ${
                              site.isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {site.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDelete(site.id)}
                            className="px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over panel for view/create/edit */}
      {mode && (
        <div className="fixed inset-0 z-40 flex items-stretch justify-end bg-slate-900/40">
          <div className="h-full w-full max-w-md bg-white shadow-xl border-l border-slate-200 flex flex-col">
            <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  {mode === "create" && "Create Site"}
                  {mode === "edit" && "Edit Site"}
                  {mode === "view" && "Site Details"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {mode === "view"
                    ? "Review site details and usage."
                    : "Define core details for this operational site."}
                </p>
              </div>
              <button
                onClick={closePanel}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {mode === "view" && selectedSite && (
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Name
                    </div>
                    <div>{selectedSite.name}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Code
                    </div>
                    <div>{selectedSite.code || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Type
                    </div>
                    <div>
                      {TYPE_LABELS[selectedSite.type] || selectedSite.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Supplier Site
                    </div>
                    <div>
                      {selectedSite.isSupplierSite
                        ? "Yes (supplier site)"
                        : "No (internal site)"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Status
                    </div>
                    <div>
                      {selectedSite.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Address
                    </div>
                    <div>{selectedSite.address || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Coordinates
                    </div>
                    <div>
                      {selectedSite.latitude && selectedSite.longitude
                        ? `${selectedSite.latitude}, ${selectedSite.longitude}`
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Notes
                    </div>
                    <div>{selectedSite.notes || "—"}</div>
                  </div>
                  {selectedSite.createdAt && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Created
                      </div>
                      <div>
                        {new Date(
                          selectedSite.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {selectedSite.updatedAt && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Updated
                      </div>
                      <div>
                        {new Date(
                          selectedSite.updatedAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(mode === "create" || mode === "edit") && (
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="Site name"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="Optional short code"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Type
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                    >
                      <option value="QUARRY">Quarry</option>
                      <option value="SAND_PIT">Sand Pit</option>
                      <option value="LOAM_PIT">Loam Pit</option>
                      <option value="WHARF">Wharf</option>
                      <option value="PROJECT_SITE">Project Site</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isSupplierSite"
                        checked={form.isSupplierSite}
                        onChange={handleChange}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                      Supplier site
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                      Active
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="Optional address or description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                        placeholder="e.g. 6.8012"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                        placeholder="e.g. -58.1553"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="Optional notes about this site"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-800 disabled:opacity-60"
                    >
                      {saving
                        ? mode === "create"
                          ? "Creating..."
                          : "Saving..."
                        : mode === "create"
                        ? "Create Site"
                        : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={closePanel}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
