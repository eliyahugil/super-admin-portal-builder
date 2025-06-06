
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import LearnMore from '@/pages/LearnMore';
import NotFound from '@/pages/NotFound';
import { AuthForm } from '@/components/auth/AuthForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ModuleManagement } from '@/components/modules/ModuleManagement';
import { BusinessSettings } from '@/components/modules/settings/BusinessSettings';
import { BusinessProfile } from '@/components/modules/settings/BusinessProfile';
import { UsersManagement } from '@/components/modules/settings/UsersManagement';
import { PermissionsManagement } from '@/components/modules/settings/PermissionsManagement';
import { BusinessIntegrations } from '@/components/modules/settings/BusinessIntegrations';
import { BusinessMultiManagement } from '@/components/modules/settings/BusinessMultiManagement';
import BusinessModulesPage from '@/components/modules/settings/BusinessModulesPage';
import { EmployeeManagement } from '@/components/modules/employees/EmployeeManagement';
import { EmployeeProfilePage } from '@/components/modules/employees/EmployeeProfilePage';
import { AttendanceManagement } from '@/components/modules/employees/AttendanceManagement';
import { ShiftManagementTabs } from '@/components/modules/shifts/ShiftManagementTabs';
import { IntegrationsRoute } from '@/components/routes/IntegrationsRoute';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { DynamicModulePage } from '@/components/modules/DynamicModulePage';
import { SubmitShiftPage } from '@/components/modules/shifts/SubmitShiftPage';
import { BusinessDashboard } from '@/components/business/BusinessDashboard';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { CreateBusinessPage } from '@/components/admin/CreateBusinessPage';
import { GlobalIntegrationsPage } from '@/pages/GlobalIntegrationsPage';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { ShiftTokenSchedulePage } from '@/components/modules/settings/ShiftTokenSchedulePage';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Public shift submission routes */}
            <Route 
              path="/shift-submission/:token" 
              element={<SubmitShiftPage />} 
            />
            <Route 
              path="/weekly-shift-submission/:token" 
              element={React.createElement(React.lazy(() => import('./components/modules/shifts/WeeklyShiftSubmissionForm').then(m => ({ default: m.WeeklyShiftSubmissionForm }))))} 
            />
            <Route 
              path="/shift-submitted" 
              element={React.createElement(React.lazy(() => import('./components/modules/shifts/ShiftSubmissionSuccess').then(m => ({ default: m.ShiftSubmissionSuccess }))))} 
            />
            
            {/* Protected routes */}
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Index />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/learn-more" element={
              <ProtectedRoute>
                <AppLayout>
                  <LearnMore />
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

            {/* Direct module routes for businesses */}
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

            {/* Admin routes */}
            <Route path="/admin" element={
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

            {/* Global integrations route */}
            <Route path="/integrations" element={
              <ProtectedRoute>
                <AppLayout>
                  <GlobalIntegrationsPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* CRM routes */}
            <Route path="/crm/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <CRMDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;

