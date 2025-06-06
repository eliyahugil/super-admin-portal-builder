
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { EmployeeProfilePage } from '@/components/modules/employees/EmployeeProfilePage';
import { BusinessModulesPage } from '@/components/modules/settings/BusinessModulesPage';
import { ShiftTokenSchedulePage } from '@/components/modules/settings/ShiftTokenSchedulePage';
import { BusinessMultiManagement } from '@/components/modules/settings/BusinessMultiManagement';

export const ModuleRoutes: React.FC = () => {
  return (
    <>
      {/* Direct module routes */}
      <Route path="/modules/:moduleRoute" element={
        <ProtectedRoute>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/modules/:moduleRoute/:subModule" element={
        <ProtectedRoute>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/modules/:moduleRoute/:subModule/:itemId" element={
        <ProtectedRoute>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Employee profile routes for direct modules */}
      <Route path="/modules/employees/profile/:employeeId" element={
        <ProtectedRoute>
          <AppLayout>
            <EmployeeProfilePage />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Settings routes */}
      <Route path="/modules/settings/modules" element={
        <ProtectedRoute>
          <AppLayout>
            <BusinessModulesPage />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/modules/settings/shift-schedule" element={
        <ProtectedRoute>
          <AppLayout>
            <ShiftTokenSchedulePage />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/modules/settings/advanced" element={
        <ProtectedRoute>
          <AppLayout>
            <BusinessMultiManagement />
          </AppLayout>
        </ProtectedRoute>
      } />
    </>
  );
};
