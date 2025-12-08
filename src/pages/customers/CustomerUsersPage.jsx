// src/pages/customers/CustomerUsersPage.jsx
import React, { useEffect, useState } from "react";
import { customerUsersApi } from "../../api/customerUsersApi";
import { customersApi } from "../../api/customersApi";
import { useAuthStore } from "../../store/authStore";

// Derive friendly portal-role label from user.portalRole
function getPortalRole(user) {
  return user.portalRole === "ADMIN" ? "CUSTOMER_ADMIN" : "CUSTOMER_USER";
}

function statusBadgeClasses(isActive) {
  if (isActive) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  return "bg-slate-50 text-slate-500 border-slate-100";
}

export function CustomerUsersPage() {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState(null); // "create" | "edit" | "view" | null
  const [selectedUser, setSelectedUser] = useState(null);

  const [filterCustomerId, setFilterCustomerId] = useState("all");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    customerId: "",
    isActive: true,
    password: "",
    portalRole: "USER",
  });

  const { user: currentUser } = useAuthStore();

  // --- helpers ---

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      customerId: "",
      isActive: true,
      password: "",
      portalRole: "USER",
    });
  };

  const openCreate = () => {
    resetForm();
    setSelectedUser(null);
    setMode("create");
    setError(null);
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setForm({
      fullName: u.fullName || u.name || "",
      email: u.email || "",
      customerId: u.customerId || "",
      isActive: u.isActive ?? true,
      password: "",
      portalRole: u.portalRole || "USER",
    });
    setMode("edit");
    setError(null);
  };

  const openView = (u) => {
    setSelectedUser(u);
    setMode("view");
    setError(null);
  };

  const closePanel = () => {
    setMode(null);
    setSelectedUser(null);
    resetForm();
    setError(null);
  };

  // --- data loading ---

  const loadCustomers = async () => {
    try {
      const data = await customersApi.list({ status: "ACTIVE" });
      const list = data.items || data || [];
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filterCustomerId !== "all" && filterCustomerId) {
        params.customerId = filterCustomerId;
      }

      const data = await customerUsersApi.list(params);
      const list = data.items || data || [];
      setUsers(list);
    } catch (err) {
      console.error("Failed to load customer users", err);
      console.log("Response data:", err.response?.data);
      setError("Failed to load customer users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCustomerId]);

  // --- handlers ---

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

    if (!form.customerId) {
      setError("Please select a customer for this user.");
      setSaving(false);
      return;
    }

    const payload = {
      fullName: form.fullName,
      email: form.email,
      customerId: form.customerId,
      isActive: form.isActive,
      portalRole: form.portalRole,
    };

    // Password required on create, optional on edit
    if (mode === "create" || form.password.trim()) {
      payload.password = form.password;
    }

    try {
      if (mode === "create") {
        await customerUsersApi.create(payload);
      } else if (mode === "edit" && selectedUser?.id) {
        await customerUsersApi.update(selectedUser.id, payload);
      }
      await loadUsers();
      closePanel();
    } catch (err) {
      console.error("Failed to save customer user", err);
      console.log("Response data:", err.response?.data);
      setError(
        "Failed to save user. Please check inputs (email, password, customer) and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await customerUsersApi.update(user.id, { isActive: !user.isActive });
      await loadUsers();
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) =>
          prev ? { ...prev, isActive: !user.isActive } : prev
        );
      }
    } catch (err) {
      console.error("Failed to toggle user active state", err);
      setError("Failed to update user status.");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await customerUsersApi.remove(userId);
      await loadUsers();
      if (selectedUser?.id === userId) {
        closePanel();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete user.");
    }
  };

  const handleMakeAdmin = async (user) => {
    // Simple version: just change portalRole to ADMIN for this user.
    try {
      await customerUsersApi.update(user.id, { portalRole: "ADMIN" });
      await loadUsers();
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) =>
          prev ? { ...prev, portalRole: "ADMIN" } : prev
        );
      }
    } catch (err) {
      console.error("Failed to set portal admin", err);
      setError("Failed to set portal admin for this user.");
    }
  };

  const filteredUsers = users; // keep hook for future extra filters

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Customer Users
          </h1>
          <p className="text-sm text-slate-500">
            Manage customer portal logins, portal roles, and account status.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-800 border border-slate-700"
        >
          + New Customer User
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

      {/* Filters + error */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Filter by customer:</span>
          <select
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
          >
            <option value="all">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.code ? `(${c.code})` : ""}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Users table card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">
            Customer Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">
              Loading customer users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No customer users found. Create a portal user to get started.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Portal Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const portalRole = getPortalRole(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-800">
                        {u.fullName || u.name || "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {u.email || "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {u.customer?.name
                          ? `${u.customer.name}${
                              u.customer.code ? ` (${u.customer.code})` : ""
                            }`
                          : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                            portalRole === "CUSTOMER_ADMIN"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : "bg-slate-50 text-slate-600 border-slate-100"
                          }`}
                        >
                          {portalRole === "CUSTOMER_ADMIN"
                            ? "Customer Admin"
                            : "Customer User"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border " +
                            statusBadgeClasses(u.isActive)
                          }
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
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
                          {portalRole !== "CUSTOMER_ADMIN" && (
                            <button
                              onClick={() => handleMakeAdmin(u)}
                              className="px-2 py-1 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                              Make Admin
                            </button>
                          )}
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
                  );
                })}
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
                  {mode === "create" && "Create Customer User"}
                  {mode === "edit" && "Edit Customer User"}
                  {mode === "view" && "Customer User Details"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {mode === "view"
                    ? "Review customer portal account details."
                    : "Define login details and portal role for this customer."}
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
                      {selectedUser.fullName ||
                        selectedUser.name ||
                        "—"}
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
                      Customer
                    </div>
                    <div>
                      {selectedUser.customer?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Portal Role
                    </div>
                    <div>
                      {getPortalRole(selectedUser) === "CUSTOMER_ADMIN"
                        ? "Customer Admin"
                        : "Customer User"}
                    </div>
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
                        {new Date(
                          selectedUser.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {selectedUser.updatedAt && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Updated
                      </div>
                      <div>
                        {new Date(
                          selectedUser.updatedAt
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
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="Customer user name"
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
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="portal.user@customer.com"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Customer
                    </label>
                    <select
                      name="customerId"
                      value={form.customerId}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      required
                    >
                      <option value="">Select customer...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.code ? `(${c.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Portal Role
                    </label>
                    <select
                      name="portalRole"
                      value={form.portalRole}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                    >
                      <option value="ADMIN">Customer Admin</option>
                      <option value="USER">Customer User</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
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
