
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    moduleKey?: string;
  }[];
}

interface SidebarMenuItemsProps {
  items: MenuItem[];
  isActive: (path: string) => boolean;
  isModuleEnabled: (moduleKey: string) => boolean;
  isSuperAdmin: boolean;
  modulesLoading: boolean;
  collapsed: boolean;
  onMenuItemClick: () => void;
}

export const SidebarMenuItems: React.FC<SidebarMenuItemsProps> = ({
  items,
  isActive,
  isModuleEnabled,
  isSuperAdmin,
  modulesLoading,
  collapsed,
  onMenuItemClick,
}) => {
  const getNavCls = ({ isActive: active }: { isActive: boolean }) =>
    active ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton asChild isActive={isActive(item.path)}>
            <NavLink 
              to={item.path} 
              className="flex items-center gap-3 px-3 py-2 text-right hover:bg-gray-100 rounded-lg transition-colors"
              onClick={onMenuItemClick}
            >
              <span className="flex-1 text-right text-sm font-medium">{item.label}</span>
              <item.icon className="h-4 w-4 flex-shrink-0" />
            </NavLink>
          </SidebarMenuButton>
          {item.subItems && isActive(item.path) && (
            <div className="mr-6 mt-1 space-y-1">
              {item.subItems
                .filter(subItem => {
                  if (subItem.moduleKey && !isSuperAdmin && !modulesLoading) {
                    return isModuleEnabled(subItem.moduleKey);
                  }
                  return true;
                })
                .map((subItem) => (
                  <SidebarMenuButton key={subItem.path} asChild size="sm">
                    <NavLink
                      to={subItem.path}
                      className="flex items-center gap-2 px-4 py-1 text-right text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={onMenuItemClick}
                    >
                      <span className="flex-1 text-right">{subItem.label}</span>
                      <subItem.icon className="h-3 w-3 flex-shrink-0" />
                    </NavLink>
                  </SidebarMenuButton>
                ))}
            </div>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
