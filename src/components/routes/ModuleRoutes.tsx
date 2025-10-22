
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProtectedModuleRoute } from '@/components/ProtectedModuleRoute';
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
// Removed import - ShiftTokenSchedulePage no longer exists
import { BusinessMultiManagement } from '@/components/modules/settings/BusinessMultiManagement';
import { BusinessProfileEdit } from '@/components/modules/settings/BusinessProfileEdit';
import EmployeeImportPage from '@/pages/business/employees/EmployeeImportPage';
import EmployeeDuplicateManagerPage from '@/pages/business/employees/EmployeeDuplicateManagerPage';
import EmployeeTokenPage from '@/pages/business/employees/EmployeeTokenPage';
import { ShiftSchedule } from '@/components/modules/shifts/ShiftSchedule';
import FridgesPage from '@/modules/fridges/pages/FridgesPage';
import FridgeDetailPage from '@/modules/fridges/pages/FridgeDetailPage';
import FridgeFormPage from '@/modules/fridges/pages/FridgeFormPage';
import { ProductionDashboard } from '@/modules/production/pages/ProductionDashboard';
import { ProductsPage } from '@/modules/production/pages/ProductsPage';
import { ProductionBatchesPage } from '@/modules/production/pages/ProductionBatchesPage';
import { RawReceiptsPage } from '@/modules/production/pages/RawReceiptsPage';
import { RawMaterialsPage } from '@/modules/production/pages/RawMaterialsPage';
import { QualityChecksPage } from '@/modules/production/pages/QualityChecksPage';
import { CleaningLogsPage } from '@/modules/production/pages/CleaningLogsPage';
import { EquipmentPage } from '@/modules/production/pages/EquipmentPage';

export const ModuleRoutes = () => (
  <>
    {/* מקררים ומקפיאים */}
    <Route path="/fridges" element={
      <ProtectedRoute>
        <AppLayout>
          <FridgesPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/fridges/new" element={
      <ProtectedRoute>
        <AppLayout>
          <FridgeFormPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/fridges/:id" element={
      <ProtectedRoute>
        <AppLayout>
          <FridgeDetailPage />
        </AppLayout>
      </ProtectedRoute>
    } />

    {/* Production Log Routes */}
    <Route path="/production" element={
      <ProtectedRoute>
        <AppLayout>
          <ProductionDashboard />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/production/products" element={
      <ProtectedRoute>
        <AppLayout>
          <ProductsPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/production/batches" element={
      <ProtectedRoute>
        <AppLayout>
          <ProductionBatchesPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/production/raw-receipts" element={
      <ProtectedRoute>
        <AppLayout>
          <RawReceiptsPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/production/materials" element={
      <ProtectedRoute>
        <AppLayout>
          <RawMaterialsPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/production/quality" element={
      <ProtectedRoute>
        <AppLayout>
          <QualityChecksPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/production/cleaning" element={
      <ProtectedRoute>
        <AppLayout>
          <CleaningLogsPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/production/equipment" element={
      <ProtectedRoute>
        <AppLayout>
          <EquipmentPage />
        </AppLayout>
      </ProtectedRoute>
    } />
    
    {/* דפי עובדים עם AppLayout */}
    <Route path="/modules/employees" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeManagementPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    
    {/* CRITICAL FIX: Specific employee profile route - must come BEFORE the generic routes */}
    <Route path="/modules/employees/profile/:employeeId" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeProfilePage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    
    {/* Employee token management route */}
    <Route path="/modules/employees/tokens/:employeeId" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeTokenPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    
    <Route path="/modules/employees/branches" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <BranchManagementPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    <Route path="/modules/employees/attendance" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <AttendanceReportPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    <Route path="/modules/employees/documents" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeDocumentsPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    {/* Alias route to support legacy path */}
    <Route path="/modules/employees/employee-requests" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeRequestsPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />

    <Route path="/modules/employees/requests" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeRequestsPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    <Route path="/modules/employees/chat" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeChatPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    <Route path="/modules/employees/tasks" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeTasksPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    <Route path="/modules/employees/import" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeImportPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />
    <Route path="/modules/employees/duplicate-manager" element={
      <ProtectedRoute>
        <ProtectedModuleRoute moduleName="employee_management">
          <AppLayout>
            <EmployeeDuplicateManagerPage />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />

    {/* URGENT FIX: Direct route for shift schedule */}
    <Route path="/modules/shifts/schedule" element={
      <ProtectedRoute>
        <AppLayout>
          <ShiftSchedule />
        </AppLayout>
      </ProtectedRoute>
    } />

    {/* Settings - profile (restricted to admins) */}
    <Route path="/modules/settings/profile" element={
      <ProtectedRoute allowedRoles={['super_admin','business_admin']} requireActiveBusiness>
        <AppLayout>
          <BusinessProfileEdit />
        </AppLayout>
      </ProtectedRoute>
    } />

    {/* Business-specific settings - profile (restricted to admins) */}
    <Route path="/business/:businessId/modules/settings/profile" element={
      <ProtectedRoute allowedRoles={['super_admin','business_admin']} requireActiveBusiness>
        <AppLayout>
          <BusinessProfileEdit />
        </AppLayout>
      </ProtectedRoute>
    } />

    {/* Branches module - restricted to admins and enabled module */}
    <Route path="/modules/branches/*" element={
      <ProtectedRoute allowedRoles={['super_admin','business_admin']}>
        <ProtectedModuleRoute moduleName="branch_management">
          <AppLayout>
            <ModuleWrapper />
          </AppLayout>
        </ProtectedModuleRoute>
      </ProtectedRoute>
    } />

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

    {/* Shift schedule route removed - token system no longer exists */}

    <Route path="/modules/settings/advanced" element={
      <ProtectedRoute>
        <AppLayout>
          <BusinessMultiManagement />
        </AppLayout>
      </ProtectedRoute>
    } />
  </>
);
