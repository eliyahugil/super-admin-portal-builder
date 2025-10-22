
import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Lazy load components for better performance
const Index = lazy(() => import('@/pages/Index'));
const LearnMore = lazy(() => import('@/pages/LearnMore'));
const GlobalIntegrationsPage = lazy(() => import('@/pages/GlobalIntegrationsPage').then(m => ({ default: m.GlobalIntegrationsPage })));
const CRMDashboard = lazy(() => import('@/components/crm/CRMDashboard').then(m => ({ default: m.CRMDashboard })));
const LeadProfile = lazy(() => import('@/components/crm/LeadProfile').then(m => ({ default: m.LeadProfile })));
const AdminIntegrationsPage = lazy(() => import('@/pages/AdminIntegrationsPage').then(m => ({ default: m.AdminIntegrationsPage })));
const SelectBusinessPage = lazy(() => import('@/pages/SelectBusinessPage').then(m => ({ default: m.SelectBusinessPage })));

export const MainRoutes = () => (
  <>
    <Route path="/" element={
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <Index />
      </Suspense>
    } />
    
    {/* Dashboard redirect - for backward compatibility */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <Index />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/learn-more" element={
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <LearnMore />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    } />

    <Route path="/integrations" element={
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <GlobalIntegrationsPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    } />

    <Route path="/crm/*" element={
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <CRMDashboard />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    } />
    
    <Route path="/crm/leads/:leadId" element={
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <LeadProfile />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    } />

    <Route path="/admin/integrations" element={
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <AdminIntegrationsPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    } />

    <Route path="/select-business" element={
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <SelectBusinessPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    } />
  </>
);