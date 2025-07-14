
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { MenuItem } from './types';

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
  onMenuItemClick
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // פתיחה ראשונית של פריטים עם תת-פריטים פעילים
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    
    items.forEach(item => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(subItem => isActive(subItem.path));
        if (hasActiveSubItem || isActive(item.path)) {
          initialExpanded[item.path] = true;
        }
      }
    });
    
    setExpandedItems(initialExpanded);
  }, [items, isActive]);

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleMenuItemClick = (hasSubItems: boolean, path: string) => {
    if (hasSubItems) {
      // רק להרחיב/לכווץ את הקבוצה, לא לסגור את הסייד-בר
      toggleExpanded(path);
    } else {
      // רק כשנבחר פריט תפריט ספציפי (לא קבוצה), נסגור את הסייד-בר במובייל
      onMenuItemClick();
    }
  };

  return (
    <SidebarMenu>
      {items.map((item) => {
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedItems[item.path] || false;
        const itemIsActive = isActive(item.path);
        const hasActiveSubItem = hasSubItems && item.subItems!.some(subItem => isActive(subItem.path));

        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton asChild={!hasSubItems} isActive={itemIsActive || hasActiveSubItem}>
              {hasSubItems ? (
                <button
                  onClick={() => handleMenuItemClick(true, item.path)}
                  className="flex items-center justify-end gap-3 text-right w-full pr-2"
                >
                  {!collapsed && (
                    <span className={`text-xs transform transition-transform duration-200 ml-2 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                      ▶
                    </span>
                  )}
                  <span className="flex-1 text-right font-medium">{item.label}</span>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                </button>
              ) : (
                <NavLink 
                  to={item.path} 
                  className="flex items-center justify-end gap-3 text-right pr-2"
                  onClick={() => handleMenuItemClick(false, item.path)}
                >
                  <span className="flex-1 text-right">{item.label}</span>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                </NavLink>
              )}
            </SidebarMenuButton>
            
            {hasSubItems && isExpanded && !collapsed && (
              <SidebarMenuSub>
                {item.subItems!.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.path}>
                    <SidebarMenuSubButton asChild isActive={isActive(subItem.path)}>
                      <NavLink
                        to={subItem.path}
                        className="flex items-center justify-end gap-3 text-right text-sm pr-4"
                        onClick={onMenuItemClick}
                      >
                        <span className="flex-1 text-right">{subItem.label}</span>
                        <subItem.icon className="h-3 w-3 flex-shrink-0" />
                      </NavLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};
