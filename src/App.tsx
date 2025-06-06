
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import LearnMore from '@/pages/LearnMore';
import { GlobalIntegrationsPage } from '@/pages/GlobalIntegrationsPage';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { IntegrationsRoute } from '@/components/routes/IntegrationsRoute';
import { AuthForm } from '@/components/auth/AuthForm';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            {/* Root route without layout */}
            <Route path="/" element={<Index />} />
            
            {/* Learn More page without layout */}
            <Route path="/learn-more" element={<LearnMore />} />
            
            {/* Auth page without layout */}
            <Route path="/auth" element={<AuthForm />} />
            
            {/* All other routes wrapped with layout */}
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  {/* Business-specific routes with modules */}
                  <Route path="/business/:businessId/modules/:moduleRoute" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/business/:businessId/modules/:moduleRoute/:subModule" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/business/:businessId/modules/:moduleRoute/:subModule/:itemId" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  {/* Standard module routes (without business prefix) */}
                  <Route path="/modules/:moduleRoute" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/modules/:moduleRoute/:subModule" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/modules/:moduleRoute/:subModule/:itemId" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/:subModule" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  {/* CRM routes */}
                  <Route path="/crm" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/crm/:subModule" element={
                    <ProtectedRoute>
                      <ModuleWrapper />
                    </ProtectedRoute>
                  } />
                  
                  {/* Integration routes */}
                  <Route path="/integrations" element={
                    <ProtectedRoute>
                      <IntegrationsRoute />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/global-integrations" element={
                    <ProtectedRoute>
                      <GlobalIntegrationsPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
