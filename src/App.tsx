
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import { GlobalIntegrationsPage } from '@/pages/GlobalIntegrationsPage';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { IntegrationsRoute } from '@/components/routes/IntegrationsRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            
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
            
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
