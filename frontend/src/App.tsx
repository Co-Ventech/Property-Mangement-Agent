import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { TenantLayout } from './layouts/TenantLayout';

// Pages
import { Login } from './pages/Login';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { TicketsQueue } from './pages/admin/TicketsQueue';
import { ContractorsList } from './pages/admin/ContractorsList';
import { ContractorDetail } from './pages/admin/ContractorDetail';
import { VisitsManager } from './pages/admin/VisitsManager';
import { TenantsManager } from './pages/admin/TenantsManager';
import { NotificationsLog } from './pages/admin/NotificationsLog';
import { AgentSettings } from './pages/admin/AgentSettings';

// Tenant Pages
import { TenantDashboard } from './pages/tenant/TenantDashboard';
import { TenantTickets } from './pages/tenant/TenantTickets';
import { ApartmentDetails } from './pages/tenant/ApartmentDetails';
import { TenantVisits } from './pages/tenant/TenantVisits';
import { TenantRent } from './pages/tenant/TenantRent';
import { TenantSettings } from './pages/tenant/TenantSettings';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return role === 'admin' ? (
    <Navigate to="/admin/overview" replace />
  ) : (
    <Navigate to="/tenant/dashboard" replace />
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="tickets" element={<TicketsQueue />} />
            <Route path="contractors" element={<ContractorsList />} />
            <Route path="contractors/:id" element={<ContractorDetail />} />
            <Route path="visits" element={<VisitsManager />} />
            <Route path="tenants" element={<TenantsManager />} />
            <Route path="notifications" element={<NotificationsLog />} />
            <Route path="settings" element={<AgentSettings />} />
          </Route>

          {/* Tenant Protected Routes */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute allowedRole="tenant">
                <TenantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/tenant/dashboard" replace />} />
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="tickets" element={<TenantTickets />} />
            <Route path="apartment" element={<ApartmentDetails />} />
            <Route path="visits" element={<TenantVisits />} />
            <Route path="rent" element={<TenantRent />} />
            <Route path="settings" element={<TenantSettings />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

