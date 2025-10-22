
import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SuperAdminRoute } from '@/components/SuperAdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { CreateBusinessPage } from '@/components/admin/CreateBusinessPage';
import { AccessRequestsManagerEnhanced } from '@/components/admin/AccessRequestsManagerEnhanced';
import { BusinessRegistrationCodesManager } from '@/components/admin/BusinessRegistrationCodesManager';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';

const CreateMissingAdmin = lazy(() => import('@/pages/superadmin/CreateMissingAdmin'));

export const SuperAdminRoutes: React.FC = () => {
  return (
    <React.Fragment>
      {/* Super Admin Dashboard */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              <SuperAdminDashboard />
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />

      {/* Access Requests Management - Updated to use enhanced version */}
      <Route path="/admin/access-requests" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              <AccessRequestsManagerEnhanced />
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />

      {/* Create Missing Admin for existing business */}
      <Route path="/admin/create-missing-admin" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <CreateMissingAdmin />
              </Suspense>
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />

      {/* Subscription Management */}
      <Route path="/admin/subscriptions" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              <SubscriptionManagement />
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />

      {/* Business Management */}
      <Route path="/admin/businesses" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              {/* Business management component */}
              <div>Business Management Component</div>
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />

      {/* Create Business */}
      <Route path="/admin/businesses/create" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              <CreateBusinessPage />
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />

      {/* System Configuration */}
      <Route path="/admin/system-config" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              {/* System config component */}
              <div>System Configuration Component</div>
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />

      {/* Registration Codes Management */}
      <Route path="/admin/registration-codes" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              <BusinessRegistrationCodesManager />
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />

      {/* Global Integrations */}
      <Route path="/admin/integrations" element={
        <ProtectedRoute>
          <SuperAdminRoute>
            <AppLayout>
              {/* Global integrations component */}
              <div>Global Integrations Component</div>
            </AppLayout>
          </SuperAdminRoute>
        </ProtectedRoute>
      } />
    </React.Fragment>
  );
};
