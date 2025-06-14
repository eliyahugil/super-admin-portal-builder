
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { MenuItem } from './MainSidebarTypes';

interface MenuGroupProps {
  title: string;
  items: MenuItem[];
  isSuperAdmin: boolean;
  isActive: (path: string) => boolean;
  onMenuItemClick: () => void;
}

export const MainSidebarMenuGroup: React.FC<MenuGroupProps> = ({
  title,
  items,
  isSuperAdmin,
  isActive,
  onMenuItemClick,
}) => {
  const getVisibleItems = (items: MenuItem[]) =>
    items.filter(item => {
      if (item.requiresSuperAdmin && !isSuperAdmin) return false;
      return true;
    });

  const visibleItems = getVisibleItems(items);
  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-right">{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive(item.path)}>
                <NavLink 
                  to={item.path} 
                  className="flex items-center gap-2 text-right"
                  onClick={onMenuItemClick}
                >
                  <span className="flex-1 text-right">{item.label}</span>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                </NavLink>
              </SidebarMenuButton>
              {item.subItems && isActive(item.path) && (
                <div className="mr-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <SidebarMenuButton key={subItem.path} asChild size="sm">
                      <NavLink
                        to={subItem.path}
                        className="flex items-center gap-2 text-right text-sm"
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
