
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { CreateBusinessPage } from '@/components/admin/CreateBusinessPage';

export const AdminRoutes: React.FC = () => {
  return (
    <>
      {/* Admin routes - restricted to super_admin only */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/:moduleRoute" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/businesses/create" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <AppLayout>
            <CreateBusinessPage />
          </AppLayout>
        </ProtectedRoute>
      } />
    </>
  );
};
