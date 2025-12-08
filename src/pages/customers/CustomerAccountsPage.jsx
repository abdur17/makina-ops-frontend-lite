// src/pages/customers/CustomerAccountsPage.jsx
import React, { useEffect, useState } from "react";
import { customersApi } from "../../api/customersApi";
import { useAuthStore } from "../../store/authStore";

// Match Prisma / Zod enums in customerSchemas.js
const CUSTOMER_TYPE_OPTIONS = [
  { value: "COMPANY", label: "Company" },
  { value: "INDIVIDUAL", label: "Individual" },
];

const CUSTOMER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "SUSPENDED", label: "Suspended" },
];

function statusBadgeClasses(status) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "PROSPECT":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "SUSPENDED":
      return "bg-red-50 text-red-700 border-red-100";
    case "INACTIVE":
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
}

export function CustomerAccountsPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState(null); // "create" | "edit" | "view" | null
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "COMPANY",
    status: "ACTIVE",
    email: "",
    phone: "",
    taxId: "",
    billingAddress: "",
    shippingAddress: "",
  });

  const { user: currentUser } = useAuthStore();

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      type: "COMPANY",
      status: "ACTIVE",
      email: "",
      phone: "",
      taxId: "",
      billingAddress: "",
      shippingAddress: "",
    });
  };

  const openCreate = () => {
    resetForm();
    setSelectedCustomer(null);
    setMode("create");
    setError(null);
  };

  const openEdit = (c) => {
    setSelectedCustomer(c);
    setForm({
      code: c.code || "",
      name: c.name || "",
      type: c.type || "COMPANY",
      status: c.status || "ACTIVE",
      email: c.email || "",
      phone: c.phone || "",
      taxId: c.taxId || "",
      billingAddress: c.billingAddress || "",
      shippingAddress: c.shippingAddress || "",
    });
    setMode("edit");
    setError(null);
  };

  const openView = (c) => {
    setSelectedCustomer(c);
    setMode("view");
    setError(null);
  };

  const closePanel = () => {
    setMode(null);
    setSelectedCustomer(null);
    resetForm();
    setError(null);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersApi.list();
      setCustomers(data.items || data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Payload matches allowed fields in customerService fieldPermissions
    const payload = {
      code: form.code || undefined,
      name: form.name,
      type: form.type,
      status: form.status,
      email: form.email || undefined,
      phone: form.phone || undefined,
      taxId: form.taxId || undefined,
      billingAddress: form.billingAddress || undefined,
      shippingAddress: form.shippingAddress || undefined,
    };

    try {
      if (mode === "create") {
        await customersApi.create(payload);
      } else if (mode === "edit" && selectedCustomer?.id) {
        await customersApi.update(selectedCustomer.id, payload);
      }
      await loadCustomers();
      closePanel();
    } catch (err) {
      console.error("Failed to save customer", err);
      console.log("Response data:", err.response?.data);
      setError("Failed to save customer. Please check inputs and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await customersApi.remove(customerId);
      await loadCustomers();
      if (selectedCustomer?.id === customerId) {
        closePanel();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete customer.");
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Customer Accounts
          </h1>
          <p className="text-sm text-slate-500">
            Manage customer companies, billing details, and core contact info.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-800 border border-slate-700"
        >
          + New Customer
        </button>
      </header>

      {/* Current user strip (optional) */}
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

      {/* Error banner (global) */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Customers table card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">
            Customers ({customers.length})
          </h2>
          {/* future: search / filters by status, type */}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No customers found yet. Create the first customer account to get started.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-800">
                      {c.name || "—"}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {c.type === "COMPANY" ? "Company" : "Individual"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border " +
                          statusBadgeClasses(c.status)
                        }
                      >
                        {c.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {c.email || "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {c.code || "—"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => openView(c)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
                  {mode === "create" && "Create Customer"}
                  {mode === "edit" && "Edit Customer"}
                  {mode === "view" && "Customer Details"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {mode === "view"
                    ? "Review customer profile and billing details."
                    : "Define core customer information and status."}
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
              {mode === "view" && selectedCustomer && (
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Name
                    </div>
                    <div>{selectedCustomer.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Type
                    </div>
                    <div>
                      {selectedCustomer.type === "COMPANY"
                        ? "Company"
                        : "Individual"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Status
                    </div>
                    <div>{selectedCustomer.status || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Email
                    </div>
                    <div>{selectedCustomer.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Phone
                    </div>
                    <div>{selectedCustomer.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Tax ID
                    </div>
                    <div>{selectedCustomer.taxId || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Billing Address
                    </div>
                    <div>{selectedCustomer.billingAddress || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Shipping Address
                    </div>
                    <div>{selectedCustomer.shippingAddress || "—"}</div>
                  </div>
                  {selectedCustomer.createdAt && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Created
                      </div>
                      <div>
                        {new Date(
                          selectedCustomer.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {selectedCustomer.updatedAt && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Updated
                      </div>
                      <div>
                        {new Date(
                          selectedCustomer.updatedAt
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
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="Customer name"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Code (optional)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="CUST-0001"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600">
                        Type
                      </label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500 bg-white"
                      >
                        {CUSTOMER_TYPE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500 bg-white"
                      >
                        {CUSTOMER_STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="billing@customer.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="+592 ..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={form.taxId}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="TIN / VAT / other"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Billing Address
                    </label>
                    <textarea
                      name="billingAddress"
                      value={form.billingAddress}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500 resize-none"
                      placeholder="Billing address"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Shipping Address
                    </label>
                    <textarea
                      name="shippingAddress"
                      value={form.shippingAddress}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500 resize-none"
                      placeholder="Shipping / delivery address"
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
                        ? "Create Customer"
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
