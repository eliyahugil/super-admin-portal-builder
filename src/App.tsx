import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/layout/Header";
import { MainSidebar } from "@/components/layout/MainSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/components/auth/AuthContext";
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
import { IntegrationsRoute } from "@/components/routes/IntegrationsRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user } = useAuth();

  // אם המשתמש לא מחובר, הצג רק את Header (שיכיל את טופס ההתחברות)
  if (!user) {
    return <Header />;
  }

  // אם המשתמש מחובר, הצג את המערכת המלאה
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50" dir="rtl">
        <MainSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Header />
            </div>
          </header>
          <div className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              {/* Default Route - Dashboard */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Super Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/businesses" 
                element={
                  <ProtectedRoute>
                    <BusinessManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/modules" 
                element={
                  <ProtectedRoute>
                    <ModuleManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/integrations" 
                element={
                  <ProtectedRoute>
                    <SuperAdminIntegrations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/system-preview/:moduleId" 
                element={
                  <ProtectedRoute>
                    <SystemPreview />
                  </ProtectedRoute>
                } 
              />

              {/* CRM Routes */}
              <Route 
                path="/crm" 
                element={
                  <ProtectedRoute>
                    <CRMDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/crm/:crmModule" 
                element={
                  <ProtectedRoute>
                    <CRMDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Business Routes with Business ID */}
              <Route 
                path="/:businessId/dashboard" 
                element={
                  <ProtectedRoute>
                    <BusinessDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/:businessId/integrations" 
                element={
                  <ProtectedRoute>
                    <BusinessIntegrationsManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/:businessId/integrations/:integration" 
                element={
                  <ProtectedRoute>
                    <BusinessIntegrationsManager />
                  </ProtectedRoute>
                } 
              />

              {/* Existing Module Routes */}
              <Route 
                path="/modules" 
                element={
                  <ProtectedRoute>
                    <ModuleManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/modules/:moduleRoute" 
                element={
                  <ProtectedRoute>
                    <ModuleWrapper />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/modules/:moduleRoute/:subModule" 
                element={
                  <ProtectedRoute>
                    <ModuleWrapper />
                  </ProtectedRoute>
                } 
              />

              {/* Legacy Routes */}
              <Route 
                path="/employees" 
                element={
                  <ProtectedRoute>
                    <EmployeeManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/custom/:moduleRoute" 
                element={
                  <ProtectedRoute>
                    <DynamicModulePage />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
