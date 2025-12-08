// src/config/navigation.js
import React from "react";

// 8 main sections from the MAKINA OPS – INTERNAL SYSTEM FUNCTIONS doc
export const sections = [
  {
    id: "dashboard",
    label: "Internal Dashboard",
    description: "High-level overview of active orders and operations.",
    modules: [
      {
        id: "active-orders",
        label: "Active Orders Overview",
        path: "/dashboard/active-orders",
      },
      {
        id: "barges-in-operation",
        label: "Barges in Operation",
        path: "/dashboard/barges-in-operation",
      },
      {
        id: "today-tonnage",
        label: "Today's Tonnage Movement",
        path: "/dashboard/today-tonnage",
      },
      {
        id: "revenue-estimates",
        label: "Estimated Revenue",
        path: "/dashboard/revenue-estimates",
      },
      {
        id: "alerts",
        label: "Alerts & Issues",
        path: "/dashboard/alerts",
      },
      {
        id: "quick-links",
        label: "Quick Links",
        path: "/dashboard/quick-links",
      },
    ],
  },
  {
    id: "orders-voyages",
    label: "Orders & Voyages",
    description: "Orders hub, voyage board, and cycle analytics.",
    modules: [
      { id: "orders-hub", label: "Orders Hub", path: "/orders/hub" },
      { id: "create-order", label: "Create Order", path: "/orders/create" },
      { id: "orders-list", label: "Orders List", path: "/orders/list" },
      {
        id: "pending-approvals",
        label: "Pending Approvals",
        path: "/orders/pending-approvals",
      },
      {
        id: "order-detail",
        label: "Order Detail View",
        path: "/orders/detail",
      },
      {
        id: "voyage-board",
        label: "Voyage Board",
        path: "/voyages/board",
      },
      {
        id: "voyage-history",
        label: "Voyage History & Detail",
        path: "/voyages/history",
      },
      {
        id: "cycle-time-viewer",
        label: "Cycle Time Viewer",
        path: "/voyages/cycle-time",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    description: "Sites, barges, personnel, tide & weather.",
    modules: [
      { id: "operations-hub", label: "Operations Hub", path: "/operations/hub" },
      { id: "sites", label: "Sites", path: "/operations/sites" },
      { id: "barges", label: "Barges", path: "/operations/barges" },
      { id: "personnel", label: "Personnel", path: "/operations/personnel" },
      {
        id: "tide-weather",
        label: "Tide & Weather Logs",
        path: "/operations/tide-weather",
      },
    ],
  },
  {
    id: "products-pricing",
    label: "Products & Pricing",
    description: "Materials, variants, and pricing tables.",
    modules: [
      { id: "products", label: "Products", path: "/products" },
      { id: "pricing", label: "Pricing Tables", path: "/pricing" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    description: "Customer accounts and customer users.",
    modules: [
      {
        id: "customer-accounts",
        label: "Customer Accounts",
        path: "/customers/accounts",
      },
      {
        id: "customer-users",
        label: "Customer Users",
        path: "/customers/users",
      },
      {
        id: "customer-orders-view",
        label: "Customer Orders View",
        path: "/customers/orders",
      },
    ],
  },
  {
    id: "suppliers",
    label: "Suppliers",
    description: "Supplier sites, portal users, and performance.",
    modules: [
      {
        id: "supplier-sites",
        label: "Supplier Sites Management",
        path: "/suppliers/sites",
      },
      {
        id: "supplier-users",
        label: "Supplier Portal Users",
        path: "/suppliers/users",
      },
      {
        id: "supplier-performance",
        label: "Supplier Performance Dashboard",
        path: "/suppliers/performance",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reporting",
    description: "Operations, utilization, site performance, revenue & cost.",
    modules: [
      {
        id: "operations-overview",
        label: "Operations Overview",
        path: "/analytics/operations",
      },
      {
        id: "barge-utilization",
        label: "Barge Utilization",
        path: "/analytics/barges",
      },
      {
        id: "site-performance",
        label: "Site Performance",
        path: "/analytics/sites",
      },
      {
        id: "revenue-cost",
        label: "Revenue & Cost Analytics",
        path: "/analytics/revenue-cost",
      },
    ],
  },
  {
    id: "admin-settings",
    label: "Admin & Settings",
    description: "Users, roles, site access, auth, and system config.",
    modules: [
      {
        id: "user-roles",
        label: "User & Role Management",
        path: "/admin/users-roles",
      },
      {
        id: "site-access",
        label: "Site Access Control",
        path: "/admin/site-access",
      },
      {
        id: "auth-settings",
        label: "Auth Settings",
        path: "/admin/auth-settings",
      },
      {
        id: "system-config",
        label: "System Config",
        path: "/admin/system-config",
      },
    ],
  },
];

export function getSectionById(id) {
  return sections.find((s) => s.id === id);
}
