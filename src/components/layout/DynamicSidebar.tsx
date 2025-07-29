
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, useSidebar } from '@/components/ui/sidebar';
import { useBusiness } from '@/hooks/useBusiness';
import { useBusinessModules } from '@/hooks/useBusinessModules';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarFooterContent } from './sidebar/SidebarFooter';
import { SidebarLoading } from './sidebar/SidebarLoading';
import { SidebarMenuGroup } from './sidebar/SidebarMenuGroup';
import { 
  createEmployeesMenuItems,
  createBusinessMenuItems,
  createSystemMenuItems,
  createAdminMenuItems
} from './sidebar/menuItems';

export const DynamicSidebar: React.FC = () => {
  const { isSuperAdmin, business, isLoading: businessLoading } = useBusiness();
  const { businessId } = useBusiness();
  const { isModuleEnabled, isLoading: modulesLoading } = useBusinessModules(businessId);
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (businessLoading) {
    return <SidebarLoading />;
  }

  const employeesMenuItems = createEmployeesMenuItems(business);
  const businessMenuItems = createBusinessMenuItems(business);
  const systemMenuItems = createSystemMenuItems(business);
  const adminMenuItems = createAdminMenuItems();

  return (
    <Sidebar side="left" className="border-l border-border hidden md:flex w-[--sidebar-width] shrink-0">
      <SidebarHeader />

      <SidebarContent className="px-2 py-4">
        <div className="space-y-6">
          <SidebarMenuGroup
            title="עובדים"
            items={employeesMenuItems}
            isActive={isActive}
            isModuleEnabled={isModuleEnabled}
            isSuperAdmin={isSuperAdmin}
            modulesLoading={modulesLoading}
            onMenuItemClick={handleMenuItemClick}
          />
          
          <SidebarMenuGroup
            title="עסקי"
            items={businessMenuItems}
            isActive={isActive}
            isModuleEnabled={isModuleEnabled}
            isSuperAdmin={isSuperAdmin}
            modulesLoading={modulesLoading}
            onMenuItemClick={handleMenuItemClick}
          />
          
          <SidebarMenuGroup
            title="מערכת"
            items={systemMenuItems}
            isActive={isActive}
            isModuleEnabled={isModuleEnabled}
            isSuperAdmin={isSuperAdmin}
            modulesLoading={modulesLoading}
            onMenuItemClick={handleMenuItemClick}
          />
          
          {isSuperAdmin && (
            <SidebarMenuGroup
              title="ניהול"
              items={adminMenuItems}
              isActive={isActive}
              isModuleEnabled={isModuleEnabled}
              isSuperAdmin={isSuperAdmin}
              modulesLoading={modulesLoading}
              onMenuItemClick={handleMenuItemClick}
            />
          )}
        </div>
      </SidebarContent>

      <SidebarFooterContent />
    </Sidebar>
  );
};
