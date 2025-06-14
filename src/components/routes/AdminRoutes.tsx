
import React from 'react';
import { Route } from 'react-router-dom';
import { SuperAdminRoute } from '@/components/SuperAdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { BusinessManagement } from '@/components/admin/BusinessManagement';
import { AccessRequestsManager } from '@/components/admin/AccessRequestsManager';
import { CreateBusinessForm } from '@/components/admin/CreateBusinessForm';
import { NewBusinessForm } from '@/components/admin/NewBusinessForm';

// NEW - import archived businesses page
import ArchivedBusinessesPage from '@/pages/ArchivedBusinessesPage';

export const AdminRoutes = () => [
  <Route
    key="admin"
    path="/admin"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <SuperAdminDashboard />
        </AppLayout>
      </SuperAdminRoute>
    }
  />,
  <Route
    key="admin-dashboard"
    path="/admin/dashboard"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <SuperAdminDashboard />
        </AppLayout>
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
    key="admin-archived-businesses"
    path="/admin/businesses/archived"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <ArchivedBusinessesPage />
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
    path="/admin/businesses/create"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <CreateBusinessForm />
        </AppLayout>
      </SuperAdminRoute>
    }
  />,
  <Route
    key="new-business"
    path="/admin/new-business"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <NewBusinessForm />
        </AppLayout>
      </SuperAdminRoute>
    }
  />
];
