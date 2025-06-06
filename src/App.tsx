import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { Index } from '@/components/Index';
import { LearnMore } from '@/components/LearnMore';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { GlobalIntegrationsPage } from '@/components/integrations/GlobalIntegrationsPage';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NotFound } from '@/components/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Public shift submission route */}
            <Route 
              path="/shift-submission/:token" 
              element={React.createElement(React.lazy(() => import('./components/modules/shifts/ShiftSubmissionForm').then(m => ({ default: m.ShiftSubmissionForm }))))} 
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

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AppLayout>
                  <ModuleWrapper />
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
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
