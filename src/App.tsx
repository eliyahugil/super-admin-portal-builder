
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NotFound from '@/pages/NotFound';
import NotAuthorized from '@/pages/NotAuthorized';
import { PublicRoutes } from '@/components/routes/PublicRoutes';
import { MainRoutes } from '@/components/routes/MainRoutes';
import { BusinessRoutes } from '@/components/routes/BusinessRoutes';
import { ModuleRoutes } from '@/components/routes/ModuleRoutes';
import { AdminRoutes } from '@/components/routes/AdminRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  console.log('🚀 App component rendering');
  console.log('🌐 Current URL:', window.location.href);
  console.log('📍 Current pathname:', window.location.pathname);
  console.log('🔍 Checking if URL matches weekly-shift-view pattern:', window.location.pathname.includes('/weekly-shift-view/'));
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Toaster />
            <Routes>
              {PublicRoutes()}
              {MainRoutes()}
              {BusinessRoutes()}
              {ModuleRoutes()}
              {AdminRoutes()}
              
              {/* Not authorized route */}
              <Route path="/not-authorized" element={<NotAuthorized />} />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
