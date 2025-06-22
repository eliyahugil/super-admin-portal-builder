
import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar';
import { SidebarMenuItems } from './SidebarMenuItems';
import { MenuItem } from './types';

interface SidebarMenuGroupProps {
  title: string;
  items: MenuItem[];
  isActive: (path: string) => boolean;
  isModuleEnabled: (moduleKey: string) => boolean;
  isSuperAdmin: boolean;
  modulesLoading: boolean;
  onMenuItemClick: () => void;
}

export const SidebarMenuGroup: React.FC<SidebarMenuGroupProps> = ({
  title,
  items,
  isActive,
  isModuleEnabled,
  isSuperAdmin,
  modulesLoading,
  onMenuItemClick
}) => {
  const getVisibleItems = (items: MenuItem[]) => {
    return items.filter(item => {
      if (item.requiresSuperAdmin && !isSuperAdmin) return false;
      if (item.moduleKey && !isSuperAdmin && !modulesLoading) {
        return isModuleEnabled(item.moduleKey);
      }
      return true;
    });
  };

  const visibleItems = getVisibleItems(items);
  
  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuItems 
          items={visibleItems}
          isActive={isActive}
          isModuleEnabled={isModuleEnabled}
          isSuperAdmin={isSuperAdmin}
          modulesLoading={modulesLoading}
          collapsed={false}
          onMenuItemClick={onMenuItemClick}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
