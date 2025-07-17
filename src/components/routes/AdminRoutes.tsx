
import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { SuperAdminRoute } from '@/components/SuperAdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Lazy load admin components for better performance
const SuperAdminDashboard = lazy(() => import('@/components/admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const BusinessManagement = lazy(() => import('@/components/admin/BusinessManagement').then(m => ({ default: m.BusinessManagement })));
const AccessRequestsManager = lazy(() => import('@/components/admin/AccessRequestsManager').then(m => ({ default: m.AccessRequestsManager })));
const CreateBusinessForm = lazy(() => import('@/components/admin/CreateBusinessForm').then(m => ({ default: m.CreateBusinessForm })));
const NewBusinessForm = lazy(() => import('@/components/admin/NewBusinessForm').then(m => ({ default: m.NewBusinessForm })));
const ArchivedBusinessesPage = lazy(() => import('@/pages/ArchivedBusinessesPage'));
const SystemSettings = lazy(() => import('@/pages/superadmin/SystemSettings'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const AdminRoutes = () => [
  <Route
    key="admin"
    path="/admin"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <SuperAdminDashboard />
          </Suspense>
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
          <Suspense fallback={<LoadingSpinner />}>
            <SuperAdminDashboard />
          </Suspense>
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
          <Suspense fallback={<LoadingSpinner />}>
            <BusinessManagement />
          </Suspense>
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
          <Suspense fallback={<LoadingSpinner />}>
            <ArchivedBusinessesPage />
          </Suspense>
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
          <Suspense fallback={<LoadingSpinner />}>
            <AccessRequestsManager />
          </Suspense>
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
          <Suspense fallback={<LoadingSpinner />}>
            <CreateBusinessForm />
          </Suspense>
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
          <Suspense fallback={<LoadingSpinner />}>
            <NewBusinessForm />
          </Suspense>
        </AppLayout>
      </SuperAdminRoute>
    }
  />,
  <Route
    key="admin-system-settings"
    path="/admin/system-settings"
    element={
      <SuperAdminRoute>
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <SystemSettings />
          </Suspense>
        </AppLayout>
      </SuperAdminRoute>
    }
  />
];
