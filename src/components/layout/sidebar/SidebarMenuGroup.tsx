
import React, { useState, useEffect } from 'react';
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
  currentRole?: 'super_admin' | 'business_admin' | 'business_user';
}

export const SidebarMenuGroup: React.FC<SidebarMenuGroupProps> = ({
  title,
  items,
  isActive,
  isModuleEnabled,
  isSuperAdmin,
  modulesLoading,
  onMenuItemClick,
  currentRole
}) => {
  const getVisibleItems = (items: MenuItem[]) => {
    return items.filter(item => {
      if (item.requiresSuperAdmin && !isSuperAdmin) return false;
      if (item.allowedRoles && !isSuperAdmin && currentRole && !item.allowedRoles.includes(currentRole)) return false;
      if (item.moduleKey && !isSuperAdmin && !modulesLoading) {
        return isModuleEnabled(item.moduleKey);
      }
      return true;
    });
  };

  const visibleItems = getVisibleItems(items);
  
  if (visibleItems.length === 0) return null;

  // בדיקה אם יש פריט פעיל בקבוצה הזו (כולל תת-פריטים)
  const hasActiveItem = visibleItems.some(item => {
    if (isActive(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => isActive(subItem.path));
    }
    return false;
  });

  // שמירת מצב פתוח/סגור עם ברירת מחדל לפי האם יש פריט פעיל
  const [isOpen, setIsOpen] = useState(hasActiveItem);

  // עדכון מצב כשמשתנה הפריט הפעיל
  useEffect(() => {
    if (hasActiveItem && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActiveItem, isOpen]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel 
        className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
            ▶
          </span>
        </div>
      </SidebarGroupLabel>
      {isOpen && (
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
      )}
    </SidebarGroup>
  );
};
