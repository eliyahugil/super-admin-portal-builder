import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ModuleManagement } from "@/components/modules/ModuleManagement";
import { EmployeeManagement } from "@/components/modules/employees/EmployeeManagement";
import { DynamicModulePage } from "@/components/modules/DynamicModulePage";
import { ModuleWrapper } from "@/components/modules/ModuleWrapper";
import { SuperAdminIntegrations } from "@/components/admin/SuperAdminIntegrations";
import { SuperAdminDashboard } from "@/components/admin/SuperAdminDashboard";
import { BusinessManagement } from "@/components/admin/BusinessManagement";
import { SystemPreview } from "@/components/admin/SystemPreview";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { BusinessDashboard } from "@/components/business/BusinessDashboard";
import { BusinessIntegrationsManager } from "@/components/business/BusinessIntegrationsManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Default Route - Dashboard */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Super Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <SuperAdminDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/businesses" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <BusinessManagement />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/modules" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <ModuleManagement />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/integrations" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <SuperAdminIntegrations />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/system-preview/:moduleId" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <SystemPreview />
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* CRM Routes */}
            <Route 
              path="/crm" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <CRMDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crm/:crmModule" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <CRMDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Business Routes with Business ID */}
            <Route 
              path="/:businessId/dashboard" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <BusinessDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/:businessId/integrations" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <BusinessIntegrationsManager />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/:businessId/integrations/:integration" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <BusinessIntegrationsManager />
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Existing Module Routes */}
            <Route 
              path="/modules" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <ModuleManagement />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/modules/:moduleRoute" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <ModuleWrapper />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/modules/:moduleRoute/:subModule" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <ModuleWrapper />
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Legacy Routes */}
            <Route 
              path="/employees" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <EmployeeManagement />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/custom/:moduleRoute" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <DynamicModulePage />
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
