
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { BusinessDashboard } from '@/components/business/BusinessDashboard';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { EmployeeProfilePage } from '@/components/modules/employees/EmployeeProfilePage';

export const BusinessRoutes: React.FC = () => {
  return (
    <React.Fragment>
      {/* Business dashboard route */}
      <Route path="/business/:businessId/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <BusinessDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Business routes */}
      <Route path="/business/:businessId/modules/:moduleRoute" element={
        <ProtectedRoute>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/business/:businessId/modules/:moduleRoute/:subModule" element={
        <ProtectedRoute>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/business/:businessId/modules/:moduleRoute/:subModule/:itemId" element={
        <ProtectedRoute>
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Employee profile routes for businesses */}
      <Route path="/business/:businessId/modules/employees/profile/:employeeId" element={
        <ProtectedRoute>
          <AppLayout>
            <EmployeeProfilePage />
          </AppLayout>
        </ProtectedRoute>
      } />
    </React.Fragment>
  );
};
