
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Clock, 
  Plug, 
  Settings,
  Shield,
  FileText,
  Calculator,
  Package,
  ShoppingCart,
  Briefcase
} from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresSuperAdmin?: boolean;
  category?: string;
}

export const MainSidebar: React.FC = () => {
  const { isSuperAdmin, business } = useBusiness();
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const coreMenuItems: MenuItem[] = [
    { path: '/', label: 'דשבורד', icon: LayoutDashboard, category: 'main' },
    { path: '/employees', label: 'עובדים', icon: Users, category: 'main' },
    { path: '/branches', label: 'סניפים', icon: Building, category: 'main' },
    { path: '/shifts', label: 'משמרות', icon: Clock, category: 'main' },
  ];

  const businessMenuItems: MenuItem[] = [
    { path: '/finance', label: 'כספים', icon: Calculator, category: 'business' },
    { path: '/inventory', label: 'מלאי', icon: Package, category: 'business' },
    { path: '/orders', label: 'הזמנות', icon: ShoppingCart, category: 'business' },
    { path: '/projects', label: 'פרויקטים', icon: Briefcase, category: 'business' },
  ];

  const systemMenuItems: MenuItem[] = [
    { path: '/integrations', label: 'אינטגרציות', icon: Plug, category: 'system' },
    { path: '/settings', label: 'הגדרות', icon: Settings, category: 'system' },
  ];

  const adminMenuItems: MenuItem[] = [
    { path: '/admin', label: 'ניהול מערכת', icon: Shield, category: 'admin', requiresSuperAdmin: true },
    { path: '/admin/modules', label: 'ניהול מודולים', icon: FileText, category: 'admin', requiresSuperAdmin: true },
    { path: '/admin/integrations', label: 'ניהול אינטגרציות', icon: Plug, category: 'admin', requiresSuperAdmin: true },
  ];

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const getVisibleItems = (items: MenuItem[]) => {
    return items.filter(item => {
      if (item.requiresSuperAdmin && !isSuperAdmin) return false;
      return true;
    });
  };

  const handleMenuItemClick = () => {
    // Close mobile sidebar when a menu item is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderMenuGroup = (title: string, items: MenuItem[]) => {
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
                    onClick={handleMenuItemClick}
                  >
                    <span className="flex-1 text-right">{item.label}</span>
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
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
        {renderMenuGroup('ראשי', coreMenuItems)}
        {renderMenuGroup('עסקי', businessMenuItems)}
        {renderMenuGroup('מערכת', systemMenuItems)}
        {isSuperAdmin && renderMenuGroup('ניהול', adminMenuItems)}
      </SidebarContent>

      <SidebarFooter className="p-4 text-right">
        <div className="text-xs text-muted-foreground">
          גרסה 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
