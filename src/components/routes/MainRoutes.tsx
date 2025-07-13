
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import LearnMore from '@/pages/LearnMore';
import { GlobalIntegrationsPage } from '@/pages/GlobalIntegrationsPage';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { LeadProfile } from '@/components/crm/LeadProfile';
import { AdminIntegrationsPage } from '@/pages/AdminIntegrationsPage';

export const MainRoutes = () => (
  <>
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
    
    <Route path="/crm/leads/:leadId" element={
      <ProtectedRoute>
        <AppLayout>
          <LeadProfile />
        </AppLayout>
      </ProtectedRoute>
    } />

    <Route path="/admin/integrations" element={
      <ProtectedRoute>
        <AppLayout>
          <AdminIntegrationsPage />
        </AppLayout>
      </ProtectedRoute>
    } />
  </>
);
