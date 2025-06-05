
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
  Briefcase,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { getModuleRoutes } from '@/utils/routeMapping';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresSuperAdmin?: boolean;
  category?: string;
  subItems?: {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const MainSidebar: React.FC = () => {
  const { isSuperAdmin, business } = useBusiness();
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Get module routes based on business context
  const moduleRoutes = getModuleRoutes(business?.id);

  const coreMenuItems: MenuItem[] = [
    { 
      path: moduleRoutes.employees.base, 
      label: 'עובדים', 
      icon: Users, 
      category: 'main',
      subItems: [
        { path: moduleRoutes.employees.files, label: 'קבצי עובדים', icon: FileText },
        { path: moduleRoutes.employees.attendance, label: 'נוכחות', icon: UserCheck },
        { path: moduleRoutes.employees.requests, label: 'בקשות עובדים', icon: CheckSquare },
        { path: moduleRoutes.employees.docs, label: 'מסמכים חתומים', icon: FileText },
        { path: moduleRoutes.employees.shifts, label: 'משמרות עובדים', icon: Clock },
        { path: moduleRoutes.employees.import, label: 'ייבוא עובדים', icon: FileText },
      ]
    },
    { 
      path: moduleRoutes.branches.base, 
      label: 'סניפים', 
      icon: Building, 
      category: 'main',
      subItems: [
        { path: moduleRoutes.branches.roles, label: 'תפקידי סניף', icon: Users },
        { path: moduleRoutes.branches.create, label: 'יצירת סניף', icon: Building },
      ]
    },
    { 
      path: moduleRoutes.shifts.base, 
      label: 'ניהול משמרות', 
      icon: Clock, 
      category: 'main',
      subItems: [
        { path: moduleRoutes.shifts.requests, label: 'בקשות משמרת', icon: CheckSquare },
        { path: moduleRoutes.shifts.approval, label: 'אישור משמרות', icon: UserCheck },
        { path: moduleRoutes.shifts.schedule, label: 'לוח משמרות', icon: Calendar },
        { path: moduleRoutes.shifts.admin, label: 'כלי מנהל', icon: Settings },
      ]
    },
  ];

  const businessMenuItems: MenuItem[] = [
    { path: '/modules/finance', label: 'כספים', icon: Calculator, category: 'business' },
    { path: '/modules/inventory', label: 'מלאי', icon: Package, category: 'business' },
    { path: '/modules/orders', label: 'הזמנות', icon: ShoppingCart, category: 'business' },
    { path: '/modules/projects', label: 'פרויקטים', icon: Briefcase, category: 'business' },
  ];

  const systemMenuItems: MenuItem[] = [
    { 
      path: moduleRoutes.integrations.base, 
      label: 'אינטגרציות', 
      icon: Plug, 
      category: 'system',
      subItems: [
        { path: moduleRoutes.integrations.googleMaps, label: 'Google Maps', icon: Plug },
        { path: moduleRoutes.integrations.whatsapp, label: 'WhatsApp', icon: Plug },
        { path: moduleRoutes.integrations.facebook, label: 'Facebook', icon: Plug },
        { path: moduleRoutes.integrations.invoices, label: 'חשבוניות', icon: Plug },
        { path: moduleRoutes.integrations.crm, label: 'CRM', icon: Plug },
        { path: moduleRoutes.integrations.payments, label: 'תשלומים', icon: Plug },
      ]
    },
    { 
      path: moduleRoutes.settings.base, 
      label: 'הגדרות', 
      icon: Settings, 
      category: 'system',
      subItems: [
        { path: moduleRoutes.settings.profile, label: 'פרטי עסק', icon: Building },
        { path: moduleRoutes.settings.users, label: 'משתמשים', icon: Users },
        { path: moduleRoutes.settings.permissions, label: 'הרשאות', icon: Shield },
      ]
    },
  ];

  const adminMenuItems: MenuItem[] = [
    { path: '/admin', label: 'לוח בקרה', icon: LayoutDashboard, category: 'admin', requiresSuperAdmin: true },
    { path: '/admin/businesses', label: 'ניהול עסקים', icon: Building, category: 'admin', requiresSuperAdmin: true },
    { path: '/admin/modules', label: 'ניהול מודולים', icon: FileText, category: 'admin', requiresSuperAdmin: true },
    { path: '/admin/integrations', label: 'ניהול אינטגרציות', icon: Plug, category: 'admin', requiresSuperAdmin: true },
    { path: '/admin/system-preview', label: 'תצוגת מערכת', icon: Shield, category: 'admin', requiresSuperAdmin: true },
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
                {item.subItems && isActive(item.path) && (
                  <div className="mr-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <SidebarMenuButton key={subItem.path} asChild size="sm">
                        <NavLink
                          to={subItem.path}
                          className="flex items-center gap-2 text-right text-sm"
                          onClick={handleMenuItemClick}
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
