import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import EmployeeManagementPage from '@/pages/business/employees/EmployeeManagementPage';
import BranchManagementPage from '@/pages/business/employees/BranchManagementPage';
import AttendanceReportPage from '@/pages/business/employees/AttendanceReportPage';
import EmployeeDocumentsPage from '@/pages/business/employees/EmployeeDocumentsPage';
import EmployeeProfilePage from '@/pages/business/employees/EmployeeProfilePage';
import EmployeeRequestsPage from '@/pages/business/employees/EmployeeRequestsPage';
import EmployeeChatPage from '@/pages/business/employees/EmployeeChatPage';
import EmployeeTasksPage from '@/pages/business/employees/EmployeeTasksPage';
import { BusinessSettings } from '@/components/modules/settings/BusinessSettings';
import { ShiftTokenSchedulePage } from '@/components/modules/settings/ShiftTokenSchedulePage';
import { BusinessMultiManagement } from '@/components/modules/settings/BusinessMultiManagement';

export const ModuleRoutes = () => (
  <>
    {/* דפי עובדים */}
    <Route path="/modules/employees" element={<EmployeeManagementPage />} />
    <Route path="/modules/employees/branches" element={<BranchManagementPage />} />
    <Route path="/modules/employees/attendance" element={<AttendanceReportPage />} />
    <Route path="/modules/employees/documents" element={<EmployeeDocumentsPage />} />
    <Route path="/modules/employees/profile" element={<EmployeeProfilePage />} />
    <Route path="/modules/employees/requests" element={<EmployeeRequestsPage />} />
    <Route path="/modules/employees/chat" element={<EmployeeChatPage />} />
    <Route path="/modules/employees/tasks" element={<EmployeeTasksPage />} />

    {/* קיימים */}
    {/* Base module routes */}
    <Route path="/modules/:moduleRoute" element={
      <ProtectedRoute>
        <AppLayout>
          <ModuleWrapper />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    {/* Sub-module routes */}
    <Route path="/modules/:moduleRoute/:subModule" element={
      <ProtectedRoute>
        <AppLayout>
          <ModuleWrapper />
        </AppLayout>
      </ProtectedRoute>
    } />

    {/* Deep sub-module routes with IDs */}
    <Route path="/modules/:moduleRoute/:subModule/:employeeId" element={
      <ProtectedRoute>
        <AppLayout>
          <ModuleWrapper />
        </AppLayout>
      </ProtectedRoute>
    } />

    {/* Specific employee profile route */}
    <Route path="/modules/employees/profile/:employeeId" element={
      <ProtectedRoute>
        <AppLayout>
          <EmployeeProfilePage />
        </AppLayout>
      </ProtectedRoute>
    } />

    {/* Business-specific module routes */}
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

    <Route path="/business/:businessId/modules/:moduleRoute/:subModule/:employeeId" element={
      <ProtectedRoute>
        <AppLayout>
          <ModuleWrapper />
        </AppLayout>
      </ProtectedRoute>
    } />

    {/* Specific settings routes */}
    <Route path="/modules/settings/modules" element={
      <ProtectedRoute>
        <AppLayout>
          <BusinessSettings />
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
