// src/pages/admin/UsersRolesPage.jsx
import React, { useEffect, useState } from "react";
import { usersApi } from "../../api/usersApi";
import { useAuthStore } from "../../store/authStore";

// Match Prisma enum: ADMIN | OPERATIONS | CUSTOMER | SUPPLIER
const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "OPERATIONS", label: "Operations" },
];

export function UsersRolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState(null); // "create" | "edit" | "view" | null
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    role: "OPERATIONS",
    isActive: true,
    password: "",
  });

  const { user: currentUser } = useAuthStore();

  // --- helpers ---
  const resetForm = () => {
    setForm({
      email: "",
      fullName: "",
      role: "OPERATIONS",
      isActive: true,
      password: "",
    });
  };

  const openCreate = () => {
    resetForm();
    setSelectedUser(null);
    setMode("create");
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setForm({
      email: u.email || "",
      fullName: u.fullName || u.name || "",
      role: u.role || "OPERATIONS",
      isActive: u.isActive ?? true,
      password: "",
    });
    setMode("edit");
  };

  const openView = (u) => {
    setSelectedUser(u);
    setMode("view");
  };

  const closePanel = () => {
    setMode(null);
    setSelectedUser(null);
    resetForm();
    setError(null);
  };

  // --- load users ---
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.list();
      setUsers(data.items || data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --- form handlers ---
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
      email: form.email,
      fullName: form.fullName,
      role: form.role,
      isActive: form.isActive,
    };

    // Backend create schema REQUIRES password.
    // Update schema only uses it if provided.
    if (mode === "create" || form.password.trim()) {
      payload.password = form.password;
    }

    try {
      if (mode === "create") {
        await usersApi.create(payload);
      } else if (mode === "edit" && selectedUser?.id) {
        await usersApi.update(selectedUser.id, payload);
      }
      await loadUsers();
      closePanel();
    } catch (err) {
      console.error("Failed to save user", err);
      console.log("Response data:", err.response?.data);
      setError("Failed to save user. Please check inputs and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await usersApi.remove(userId);
      await loadUsers();
      if (selectedUser?.id === userId) {
        closePanel();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete user.");
    }
  };


const handleToggleActive = async (user) => {
    try {
      await usersApi.update(user.id, { isActive: !user.isActive });
      await loadUsers();
      if (selectedUser?.id === user.id) {
        // keep side panel in sync if it's open
        setSelectedUser((prev) =>
          prev ? { ...prev, isActive: !user.isActive } : prev
        );
      }
    } catch (err) {
      console.error("Failed to toggle active state", err);
      setError("Failed to update user status.");
    }
  };


  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            User &amp; Role Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage system users, roles, and account status.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-800 border border-slate-700"
        >
          + New User
        </button>
      </header>

      {/* Info strip about current user */}
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Users table card – full width */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">
            Users ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No users found. Create the first user to get started.
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-800">
                      {u.fullName || u.name || "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {u.email || "—"}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {u.role || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {u.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-100">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-100">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2">
                    <div className="flex justify-end gap-2 text-xs">
                        <button
                        onClick={() => openView(u)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                        View
                        </button>
                        <button
                        onClick={() => openEdit(u)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                        Edit
                        </button>
                        <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2 py-1 rounded-lg border text-xs ${
                            u.isActive
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                        >
                        {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                        onClick={() => handleDelete(u.id)}
                        className="px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        >
                        Delete
                        </button>
                    </div>
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over panel overlay */}
      {mode && (
        <div className="fixed inset-0 z-40 flex items-stretch justify-end bg-slate-900/40">
          <div className="h-full w-full max-w-md bg-white shadow-xl border-l border-slate-200 flex flex-col">
            <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  {mode === "create" && "Create User"}
                  {mode === "edit" && "Edit User"}
                  {mode === "view" && "User Details"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {mode === "view"
                    ? "Review user details and permissions."
                    : "Define core account details and role."}
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
              {mode === "view" && selectedUser && (
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Name
                    </div>
                    <div>
                      {selectedUser.fullName || selectedUser.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Email
                    </div>
                    <div>{selectedUser.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Role
                    </div>
                    <div>{selectedUser.role || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Status
                    </div>
                    <div>
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                  {selectedUser.createdAt && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Created
                      </div>
                      <div>
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {selectedUser.updatedAt && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Updated
                      </div>
                      <div>
                        {new Date(selectedUser.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(mode === "create" || mode === "edit") && (
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm 
                                bg-white text-slate-900 placeholder:text-slate-400
                                focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"

                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm 
                                bg-white text-slate-900 placeholder:text-slate-400
                                focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="jane@makina.local"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Role
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500 bg-white"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Password – required on create, optional on edit */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm 
                                bg-white text-slate-900 placeholder:text-slate-400
                                focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder={
                        mode === "create"
                          ? "At least 8 characters"
                          : "Leave blank to keep current password"
                      }
                      required={mode === "create"}
                    />
                    {mode === "edit" && (
                      <p className="text-[11px] text-slate-400">
                        Leave blank to keep the existing password.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                      Active account
                    </label>
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
                        ? "Create User"
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

