
import React, { useState } from 'react';
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const getVisibleItems = (items: MenuItem[]) =>
    items.filter(item => {
      if (item.requiresSuperAdmin && !isSuperAdmin) return false;
      return true;
    });

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleMenuItemClick = (item: MenuItem, event: React.MouseEvent) => {
    if (item.subItems && item.subItems.length > 0) {
      // עבור פריטים עם תת-פריטים - רק נרחיב/נכווץ
      event.preventDefault();
      event.stopPropagation();
      toggleExpanded(item.path);
    } else {
      // עבור פריטים ללא תת-פריטים - ננווט ונסגור את הסיידבר
      onMenuItemClick();
    }
  };

  const visibleItems = getVisibleItems(items);
  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-right">{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              {item.subItems && item.subItems.length > 0 ? (
                // פריט עם תת-פריטים - כפתור להרחבה/כיווץ
                <>
                  <SidebarMenuButton 
                    isActive={isActive(item.path)}
                    onClick={(event) => handleMenuItemClick(item, event)}
                    className="flex items-center gap-2 text-right"
                  >
                    <span className="flex-1 text-right">{item.label}</span>
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                  </SidebarMenuButton>
                  {expandedItems[item.path] && (
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
                </>
              ) : (
                // פריט ללא תת-פריטים - קישור רגיל
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
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
