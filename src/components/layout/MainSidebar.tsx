import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useBusiness } from '@/hooks/useBusiness';
import { buildMainSidebarMenuItems } from './sidebar/MainSidebarMenuConfig';
import { MainSidebarMenuGroup } from './sidebar/MainSidebarMenuGroups';

export const MainSidebar: React.FC = () => {
  const { isSuperAdmin, business } = useBusiness();
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    coreMenuItems,
    businessMenuItems,
    systemMenuItems,
    adminMenuItems,
  } = buildMainSidebarMenuItems(isSuperAdmin, business);

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const handleMenuItemClick = () => {
    // Close mobile sidebar when a menu item is clicked
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar side="right" className="border-r border-border">
      <SidebarHeader className="p-4 text-right">
        <h2 className="text-lg font-bold text-foreground text-right">
          {business?.name || 'ניהול מערכת'}
        </h2>
        {business && (
          <p className="text-sm text-muted-foreground text-right">
            {isSuperAdmin ? 'מנהל על' : 'משתמש עסקי'}
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <MainSidebarMenuGroup
          title="ראשי"
          items={coreMenuItems}
          isSuperAdmin={isSuperAdmin}
          isActive={isActive}
          onMenuItemClick={handleMenuItemClick}
        />
        <MainSidebarMenuGroup
          title="עסקי"
          items={businessMenuItems}
          isSuperAdmin={isSuperAdmin}
          isActive={isActive}
          onMenuItemClick={handleMenuItemClick}
        />
        <MainSidebarMenuGroup
          title="מערכת"
          items={systemMenuItems}
          isSuperAdmin={isSuperAdmin}
          isActive={isActive}
          onMenuItemClick={handleMenuItemClick}
        />
        {isSuperAdmin && (
          <MainSidebarMenuGroup
            title="ניהול"
            items={adminMenuItems}
            isSuperAdmin={isSuperAdmin}
            isActive={isActive}
            onMenuItemClick={handleMenuItemClick}
          />
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 text-right">
        <div className="text-xs text-muted-foreground">
          גרסה 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
