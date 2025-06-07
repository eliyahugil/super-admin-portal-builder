
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProtectedModuleRoute } from '@/components/ProtectedModuleRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Example of how to combine all protection layers
export const ProtectedModuleRoutes: React.FC = () => {
  return (
    <React.Fragment>
      {/* Employee Management - requires employee module */}
      <Route path="/business/:businessId/employees" element={
        <ProtectedRoute>
          <ProtectedModuleRoute moduleName="employee_management">
            <AppLayout>
              {/* Your employee component here */}
            </AppLayout>
          </ProtectedModuleRoute>
        </ProtectedRoute>
      } />

      {/* Shift Management - requires shift module */}
      <Route path="/business/:businessId/shifts" element={
        <ProtectedRoute>
          <ProtectedModuleRoute moduleName="shift_management">
            <AppLayout>
              {/* Your shift component here */}
            </AppLayout>
          </ProtectedModuleRoute>
        </ProtectedRoute>
      } />

      {/* Salary Management - requires salary module */}
      <Route path="/business/:businessId/salary" element={
        <ProtectedRoute>
          <ProtectedModuleRoute moduleName="salary_management">
            <AppLayout>
              {/* Your salary component here */}
            </AppLayout>
          </ProtectedModuleRoute>
        </ProtectedRoute>
      } />

      {/* Employee Documents - requires documents module */}
      <Route path="/business/:businessId/documents" element={
        <ProtectedRoute>
          <ProtectedModuleRoute moduleName="employee_documents">
            <AppLayout>
              {/* Your documents component here */}
            </AppLayout>
          </ProtectedModuleRoute>
        </ProtectedRoute>
      } />

      {/* Branch Management - requires branch module */}
      <Route path="/business/:businessId/branches" element={
        <ProtectedRoute>
          <ProtectedModuleRoute moduleName="branch_management">
            <AppLayout>
              {/* Your branch component here */}
            </AppLayout>
          </ProtectedModuleRoute>
        </ProtectedRoute>
      } />
    </React.Fragment>
  );
};
