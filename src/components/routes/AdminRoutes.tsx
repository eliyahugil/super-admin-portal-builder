
import React from 'react';
import { Route } from 'react-router-dom';
import { SuperAdminRoute } from '@/components/SuperAdminRoute';
import { Dashboard } from '@/components/dashboard/Dashboard';
import CreateBusinessPage from '@/pages/CreateBusinessPage';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { BusinessManagement } from '@/components/admin/BusinessManagement';
import { AccessRequestsManager } from '@/components/admin/AccessRequestsManager';
import { AppLayout } from '@/components/layout/AppLayout';

export const AdminRoutes = () => [
  <Route
    key="admin"
    path="/admin"
    element={
      <SuperAdminRoute>
        <Dashboard />
      </SuperAdminRoute>
    }
  />,
  <Route
    key="admin-dashboard"
    path="/admin/dashboard"
    element={
      <SuperAdminRoute>
        <SuperAdminDashboard />
      </SuperAdminRoute>
    }
  />,
  <Route
    key="admin-businesses"
    path="/admin/businesses"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <BusinessManagement />
        </AppLayout>
      </SuperAdminRoute>
    }
  />,
  <Route
    key="admin-access-requests"
    path="/admin/access-requests"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <AccessRequestsManager />
        </AppLayout>
      </SuperAdminRoute>
    }
  />,
  <Route
    key="create-business"
    path="/create-business"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <CreateBusinessPage />
        </AppLayout>
      </SuperAdminRoute>
    }
  />
];
