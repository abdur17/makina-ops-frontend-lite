// src/pages/customers/CustomerOrdersPage.jsx
import React, { useEffect, useState } from "react";
import { customerOrdersApi } from "../../api/customerOrdersApi";
import { customersApi } from "../../api/customersApi";
import { useAuthStore } from "../../store/authStore";

const STATUS_BADGES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  APPROVED: "bg-sky-50 text-sky-700 border-sky-100",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-100",
};

const SOURCE_BADGES = {
  PORTAL: "bg-slate-50 text-slate-700 border-slate-100",
  INTERNAL: "bg-slate-900 text-slate-50 border-slate-800",
};

export function CustomerOrdersPage() {
  const { user: currentUser } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [filterCustomerId, setFilterCustomerId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [mode, setMode] = useState(null); // "view" | "create" | "edit" | null
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [form, setForm] = useState({
    orderNumber: "",
    customerId: "",
    title: "",
    status: "PENDING",
    source: "PORTAL",
    requestedDate: "",
    notes: "",
  });

  const resetForm = () => {
    setForm({
      orderNumber: "",
      customerId: "",
      title: "",
      status: "PENDING",
      source: "PORTAL",
      requestedDate: "",
      notes: "",
    });
  };

  const openCreate = () => {
    resetForm();
    setSelectedOrder(null);
    setMode("create");
    setError(null);
  };

  const openView = (order) => {
    setSelectedOrder(order);
    setMode("view");
    setError(null);
  };

  const openEdit = (order) => {
    setSelectedOrder(order);
    setForm({
      orderNumber: order.orderNumber || "",
      customerId: order.customerId || order.customer?.id || "",
      title: order.title || "",
      status: order.status || "PENDING",
      source: order.source || "PORTAL",
      requestedDate: order.requestedDate
        ? order.requestedDate.slice(0, 10)
        : "",
      notes: order.notes || "",
    });
    setMode("edit");
    setError(null);
  };

  const closePanel = () => {
    setMode(null);
    setSelectedOrder(null);
    resetForm();
    setError(null);
  };

  const loadCustomers = async () => {
    try {
      const data = await customersApi.list({ status: "ACTIVE" });
      const list = data.items || data || [];
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filterCustomerId !== "all" && filterCustomerId) {
        params.customerId = filterCustomerId;
      }
      if (filterStatus !== "all" && filterStatus) {
        params.status = filterStatus;
      }

      const data = await customerOrdersApi.list(params);
      const list = data.items || data || [];
      setOrders(list);
    } catch (err) {
      console.error("Failed to load customer orders", err);
      console.log("Response data:", err.response?.data);
      setError("Failed to load customer orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCustomerId, filterStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      orderNumber: form.orderNumber,
      customerId: form.customerId,
      title: form.title || undefined,
      status: form.status,
      source: form.source,
      requestedDate: form.requestedDate
        ? new Date(form.requestedDate).toISOString()
        : undefined,
      notes: form.notes || undefined,
    };

    try {
      if (mode === "create") {
        await customerOrdersApi.create(payload);
      } else if (mode === "edit" && selectedOrder?.id) {
        await customerOrdersApi.update(selectedOrder.id, payload);
      }
      await loadOrders();
      closePanel();
    } catch (err) {
      console.error("Failed to save order", err);
      console.log("Response data:", err.response?.data);
      setError(
        "Failed to save order. Please check inputs (order number, customer) and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    try {
      await customerOrdersApi.remove(orderId);
      await loadOrders();
      if (selectedOrder?.id === orderId) closePanel();
    } catch (err) {
      console.error("Failed to delete order", err);
      setError("Failed to delete order.");
    }
  };

  const filteredOrders = orders; // additional client-side filters can be added later

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Customer Orders
          </h1>
          <p className="text-sm text-slate-500">
            Internal view of all customer orders for support, disputes, and
            performance review.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-800 border border-slate-700"
        >
          + New Order
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

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
          >
            <option value="all">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Orders table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">
            Customer Orders ({filteredOrders.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">
              Loading customer orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No customer orders found.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Order #</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">Requested</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const statusClass =
                    STATUS_BADGES[o.status] || "bg-slate-50 text-slate-700";
                  const sourceClass =
                    SOURCE_BADGES[o.source] || "bg-slate-50 text-slate-700";

                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-800">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {o.customer?.name
                          ? `${o.customer.name}${
                              o.customer.code ? ` (${o.customer.code})` : ""
                            }`
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {o.title || "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${statusClass}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${sourceClass}`}
                        >
                          {o.source === "PORTAL"
                            ? "Customer Portal"
                            : "Internal"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {o.requestedDate
                          ? new Date(o.requestedDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => openView(o)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(o)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(o.id)}
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
                  {mode === "create" && "Create Customer Order"}
                  {mode === "edit" && "Edit Customer Order"}
                  {mode === "view" && "Customer Order Details"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {mode === "view"
                    ? "Review customer order details and status."
                    : "Define order basics and link to customer account."}
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
              {mode === "view" && selectedOrder && (
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Order #
                    </div>
                    <div>{selectedOrder.orderNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Customer
                    </div>
                    <div>
                      {selectedOrder.customer?.name || "—"}
                      {selectedOrder.customer?.code
                        ? ` (${selectedOrder.customer.code})`
                        : ""}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Title
                    </div>
                    <div>{selectedOrder.title || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Status
                    </div>
                    <div>{selectedOrder.status}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Source
                    </div>
                    <div>
                      {selectedOrder.source === "PORTAL"
                        ? "Customer Portal"
                        : "Internal"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Requested Date
                    </div>
                    <div>
                      {selectedOrder.requestedDate
                        ? new Date(
                            selectedOrder.requestedDate
                          ).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Notes
                    </div>
                    <div>{selectedOrder.notes || "—"}</div>
                  </div>
                </div>
              )}

              {(mode === "create" || mode === "edit") && (
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Order Number
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={form.orderNumber}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="CORD-000001"
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
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                      placeholder="Short description"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Source
                    </label>
                    <select
                      name="source"
                      value={form.source}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                    >
                      <option value="PORTAL">Customer Portal</option>
                      <option value="INTERNAL">Internal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Requested Date
                    </label>
                    <input
                      type="date"
                      name="requestedDate"
                      value={form.requestedDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:border-slate-500"
                    />
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
                      placeholder="Additional order details, instructions..."
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
                        ? "Create Order"
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
