
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import NotFound from '@/pages/NotFound';
import { SubmitShiftPage } from '@/components/modules/shifts/SubmitShiftPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import LearnMore from '@/pages/LearnMore';
import { GlobalIntegrationsPage } from '@/pages/GlobalIntegrationsPage';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { BusinessDashboard } from '@/components/business/BusinessDashboard';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { EmployeeProfilePage } from '@/components/modules/employees/EmployeeProfilePage';
import { BusinessSettings } from '@/components/modules/settings/BusinessSettings';
import { ShiftTokenSchedulePage } from '@/components/modules/settings/ShiftTokenSchedulePage';
import { BusinessMultiManagement } from '@/components/modules/settings/BusinessMultiManagement';
import { CreateBusinessPage } from '@/components/admin/CreateBusinessPage';

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
              element={React.createElement(React.lazy(() => import('@/components/modules/shifts/WeeklyShiftSubmissionForm').then(m => ({ default: m.WeeklyShiftSubmissionForm }))))} 
            />
            <Route 
              path="/shift-submitted" 
              element={React.createElement(React.lazy(() => import('@/components/modules/shifts/ShiftSubmissionSuccess').then(m => ({ default: m.ShiftSubmissionSuccess }))))} 
            />
            
            {/* Auth route */}
            <Route path="/auth" element={<AuthForm />} />
            
            {/* Protected main routes */}
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

            <Route path="/integrations" element={
              <ProtectedRoute>
                <AppLayout>
                  <GlobalIntegrationsPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/crm/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <CRMDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Business routes */}
            <Route path="/business/:businessId/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <BusinessDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

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

            {/* Specific Employee Profile Route */}
            <Route path="/business/:businessId/modules/employees/profile/:employeeId" element={
              <ProtectedRoute>
                <AppLayout>
                  <EmployeeProfilePage />
                </AppLayout>
              </ProtectedRoute>
            } />

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

            <Route path="/modules/:moduleRoute/:subModule/:employeeId" element={
              <ProtectedRoute>
                <AppLayout>
                  <ModuleWrapper />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Specific Employee Profile Route for direct modules */}
            <Route path="/modules/employees/profile/:employeeId" element={
              <ProtectedRoute>
                <AppLayout>
                  <EmployeeProfilePage />
                </AppLayout>
              </ProtectedRoute>
            } />

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

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AppLayout>
                  <ModuleWrapper />
                </AppLayout>
              </ProtectedRoute>
            } />

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

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
