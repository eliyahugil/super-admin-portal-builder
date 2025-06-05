import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Index } from '@/pages/Index';
import { GlobalIntegrationsPage } from '@/pages/GlobalIntegrationsPage';
import { BusinessDashboard } from '@/pages/business/BusinessDashboard';
import BusinessProfile from '@/pages/business/BusinessProfile';
import BusinessUsers from '@/pages/business/BusinessUsers';
import BusinessIntegrations from '@/pages/business/BusinessIntegrations';
import BusinessModuleConfig from '@/pages/business/BusinessModuleConfig';
import { SuperAdminDashboard } from '@/pages/admin/SuperAdminDashboard';
import { SuperAdminUsers } from '@/pages/admin/SuperAdminUsers';
import { SuperAdminBusinesses } from '@/pages/admin/SuperAdminBusinesses';
import { SuperAdminModuleConfigPage } from '@/pages/admin/SuperAdminModuleConfigPage';
import { SuperAdminIntegrationsPage } from '@/pages/admin/SuperAdminIntegrationsPage';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { VerifyEmail } from '@/pages/VerifyEmail';
import { BusinessSignup } from '@/pages/BusinessSignup';
import { BusinessLogin } from '@/pages/BusinessLogin';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/business/signup" element={<BusinessSignup />} />
            <Route path="/business/login" element={<BusinessLogin />} />

            {/* Business Routes */}
            <Route path="/:businessId" element={
              <ProtectedRoute>
                <BusinessDashboard />
              </ProtectedRoute>
            } />
            <Route path="/:businessId/profile" element={
              <ProtectedRoute>
                <BusinessProfile />
              </ProtectedRoute>
            } />
            <Route path="/:businessId/users" element={
              <ProtectedRoute>
                <BusinessUsers />
              </ProtectedRoute>
            } />
            <Route path="/:businessId/integrations" element={
              <ProtectedRoute>
                <BusinessIntegrations />
              </ProtectedRoute>
            } />
            <Route path="/:businessId/modules" element={
              <ProtectedRoute>
                <BusinessModuleConfig />
              </ProtectedRoute>
            } />

            {/* Super Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/businesses" element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminBusinesses />
              </ProtectedRoute>
            } />
            <Route path="/admin/modules" element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminModuleConfigPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/modules/global-integrations" element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminIntegrationsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/global-integrations" element={
              <ProtectedRoute>
                <GlobalIntegrationsPage />
              </ProtectedRoute>
            } />
            
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
