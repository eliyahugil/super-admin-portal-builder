
import React from 'react';
import { useBusiness } from '@/hooks/useBusiness';
import { SuperAdminIntegrationsDashboard } from '@/components/admin/SuperAdminIntegrationsDashboard';
import { IntegrationDashboard } from '@/components/integrations/IntegrationDashboard';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/MainSidebar';

export const IntegrationsRoute: React.FC = () => {
  const { isSuperAdmin } = useBusiness();

  console.log('=== IntegrationsRoute ===');
  console.log('Is Super Admin:', isSuperAdmin);

  // For super admin, show the advanced dashboard with real data
  if (isSuperAdmin) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <MainSidebar />
          <div className="flex-1">
            <header className="h-12 flex items-center border-b bg-background px-4">
              <SidebarTrigger />
            </header>
            <SuperAdminIntegrationsDashboard />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // For regular users, show the standard integration dashboard
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MainSidebar />
        <div className="flex-1">
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
          </header>
          <IntegrationDashboard />
        </div>
      </div>
    </SidebarProvider>
  );
};
