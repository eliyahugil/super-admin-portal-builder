
import React from 'react';
import { useParams } from 'react-router-dom';
import { useBusiness } from '@/hooks/useBusiness';
import { SuperAdminIntegrationsDashboard } from '@/components/admin/SuperAdminIntegrationsDashboard';
import { BusinessIntegrations } from '@/components/modules/settings/BusinessIntegrations';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/MainSidebar';

export const IntegrationsRoute: React.FC = () => {
  const { businessId } = useParams();
  const { isSuperAdmin } = useBusiness();

  console.log('=== IntegrationsRoute ===');
  console.log('Is Super Admin:', isSuperAdmin);
  console.log('Business ID from params:', businessId);

  // For super admin without specific business context, show the advanced dashboard
  if (isSuperAdmin && !businessId) {
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

  // For business-specific integrations (both super admin and regular users)
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MainSidebar />
        <div className="flex-1">
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
          </header>
          <div className="p-6">
            <BusinessIntegrations />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
