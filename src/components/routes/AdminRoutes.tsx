
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { CreateBusinessPage } from '@/components/admin/CreateBusinessPage';

export const AdminRoutes: React.FC = () => {
  return (
    <>
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Handle admin/businesses route specifically */}
      <Route path="/admin/:moduleRoute" element={
        <ProtectedRoute>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/businesses/create" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateBusinessPage />
          </AppLayout>
        </ProtectedRoute>
      } />
    </>
  );
};
