
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import NotFound from '@/pages/NotFound';

// Route components
import { PublicRoutes } from '@/components/routes/PublicRoutes';
import { MainRoutes } from '@/components/routes/MainRoutes';
import { BusinessRoutes } from '@/components/routes/BusinessRoutes';
import { ModuleRoutes } from '@/components/routes/ModuleRoutes';
import { AdminRoutes } from '@/components/routes/AdminRoutes';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Public routes */}
            {PublicRoutes()}
            
            {/* Auth route */}
            <Route path="/auth" element={<AuthForm />} />
            
            {/* Main protected routes */}
            {MainRoutes()}
            
            {/* Business routes */}
            {BusinessRoutes()}
            
            {/* Module routes */}
            {ModuleRoutes()}
            
            {/* Admin routes */}
            {AdminRoutes()}

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
