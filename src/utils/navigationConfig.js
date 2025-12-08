// src/utils/navigationConfig.js

export const NAV_SECTIONS = [
  {
    id: "admin",
    label: "Admin",
    icon: "shield", // you can swap to lucide icons later
    modules: [
      {
        id: "users",
        label: "Users",
        description: "Manage all users and their roles.",
        path: "/users",
      },
      // later: roles, audit logs, etc.
    ],
  },
  {
    id: "crm",
    label: "Customers",
    icon: "users",
    modules: [
      {
        id: "customers",
        label: "Customer Registry",
        description: "Create and manage customer accounts.",
        path: "/customers",
      },
    ],
  },
  {
    id: "suppliers",
    label: "Suppliers",
    icon: "truck",
    modules: [
      {
        id: "suppliers",
        label: "Supplier Registry",
        description: "Manage quarries, transporters and other suppliers.",
        path: "/suppliers",
      },
    ],
  },
];
