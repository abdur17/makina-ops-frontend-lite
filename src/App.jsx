// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { SectionHub } from "./pages/SectionHub";
import { LoginPage } from "./pages/auth/LoginPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { UsersRolesPage } from "./pages/admin/UsersRolesPage";
// src/App.jsx
import { CustomerAccountsPage } from "./pages/customers/CustomerAccountsPage";
import { CustomerUsersPage } from "./pages/customers/CustomerUsersPage";
import { CustomerOrdersPage } from "./pages/customers/CustomerOrdersPage";
import { OperationsSitesPage } from "./pages/operations/OperationsSitesPage";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected app layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Default -> dashboard section tiles */}
          <Route index element={<Navigate to="/section/dashboard" replace />} />

          {/* Section hubs */}
          <Route path="section/:sectionId" element={<SectionHub />} />

          {/* Placeholder routes for all module paths */}
          <Route
            path="dashboard/:slug"
            element={<PlaceholderPage title="Dashboard Module" />}
          />
          <Route
            path="orders/:slug"
            element={<PlaceholderPage title="Orders & Voyages Module" />}
          />
          <Route
            path="voyages/:slug"
            element={<PlaceholderPage title="Orders & Voyages Module" />}
          />

             {/* Operations modules */}
             <Route path="operations/sites" element={<OperationsSitesPage />} />
          <Route
            path="operations/:slug"
            element={<PlaceholderPage title="Operations Module" />}
          />
          <Route
            path="products"
            element={<PlaceholderPage title="Products" />}
          />
          <Route
            path="pricing"
            element={<PlaceholderPage title="Pricing Tables" />}
          />

          {/* Customers */}
          <Route path="customers/accounts" element={<CustomerAccountsPage />} />
          <Route path="customers/users" element={<CustomerUsersPage />} />
          <Route path="customers/orders" element={<CustomerOrdersPage />}/>
          <Route path="customers/:slug" element={<PlaceholderPage title="Customers Module" />}
          />
          
          <Route
            path="suppliers/:slug"
            element={<PlaceholderPage title="Suppliers Module" />}
          />
          <Route
            path="analytics/:slug"
            element={<PlaceholderPage title="Analytics Module" />}
          />

          <Route path="admin/users-roles" element={<UsersRolesPage />} />

          <Route
            path="admin/:slug"
            element={<PlaceholderPage title="Admin & Settings Module" />}
          />

          {/* Catch-all */}
          <Route
            path="*"
            element={<PlaceholderPage title="Page Not Found" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
