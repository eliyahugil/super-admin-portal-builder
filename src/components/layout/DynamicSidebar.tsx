import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  CheckSquare,
  Calendar,
  User,
  LinkIcon
} from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useBusinessModules } from '@/hooks/useBusinessModules';
import { getModuleRoutes } from '@/utils/routeMapping';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarMenuItems } from './sidebar/SidebarMenuItems';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresSuperAdmin?: boolean;
  moduleKey?: string;
  category?: string;
  subItems?: {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    moduleKey?: string;
  }[];
}

export const DynamicSidebar: React.FC = () => {
  const { isSuperAdmin, business, isLoading: businessLoading } = useBusiness();
  const { businessId } = useBusiness();
  const { isModuleEnabled, isLoading: modulesLoading } = useBusinessModules(businessId);
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  console.log('DynamicSidebar - Current state:', {
    business: business?.name,
    businessId,
    isSuperAdmin,
    businessLoading,
    modulesLoading
  });

  // Get module routes based on business context
  const moduleRoutes = getModuleRoutes(business?.id);

  // Core menu items with module requirements
  const coreMenuItems: MenuItem[] = [
    { 
      path: moduleRoutes.employees.base, 
      label: 'עובדים', 
      icon: Users, 
      category: 'main',
      moduleKey: 'employee_management',
      subItems: [
        { path: moduleRoutes.employees.files, label: 'קבצי עובדים', icon: FileText, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.profile, label: 'פרופיל עובד', icon: User, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.attendance, label: 'נוכחות', icon: UserCheck, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.requests, label: 'בקשות עובדים', icon: CheckSquare, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.docs, label: 'מסמכים חתומים', icon: FileText, moduleKey: 'employee_documents' },
        { path: moduleRoutes.employees.shifts, label: 'משמרות עובדים', icon: Clock, moduleKey: 'shift_management' },
        { path: moduleRoutes.employees.import, label: 'ייבוא עובדים', icon: FileText, moduleKey: 'employee_management' },
      ]
    },
    { 
      path: moduleRoutes.branches.base, 
      label: 'סניפים', 
      icon: Building, 
      category: 'main',
      moduleKey: 'branch_management',
      subItems: [
        { path: moduleRoutes.branches.roles, label: 'תפקידי סניף', icon: Users, moduleKey: 'branch_management' },
        { path: moduleRoutes.branches.create, label: 'יצירת סניף', icon: Building, moduleKey: 'branch_management' },
      ]
    },
    { 
      path: moduleRoutes.shifts.base, 
      label: 'ניהול משמרות', 
      icon: Clock, 
      category: 'main',
      moduleKey: 'shift_management',
      subItems: [
        { path: moduleRoutes.shifts.requests, label: 'בקשות משמרת', icon: CheckSquare, moduleKey: 'shift_management' },
        { path: moduleRoutes.shifts.approval, label: 'אישור משמרות', icon: UserCheck, moduleKey: 'shift_management' },
        { path: moduleRoutes.shifts.schedule, label: 'לוח משמרות', icon: Calendar, moduleKey: 'shift_management' },
        { path: moduleRoutes.shifts.admin, label: 'כלי מנהל', icon: Settings, moduleKey: 'shift_management' },
        { path: `${moduleRoutes.shifts.base}/tokens`, label: 'טוקני הגשה', icon: LinkIcon, moduleKey: 'shift_management' },
      ]
    },
  ];

  const businessMenuItems: MenuItem[] = [
    { path: '/modules/finance', label: 'כספים', icon: Calculator, category: 'business', moduleKey: 'finance_management' },
    { path: '/modules/inventory', label: 'מלאי', icon: Package, category: 'business', moduleKey: 'inventory_management' },
    { path: '/modules/orders', label: 'הזמנות', icon: ShoppingCart, category: 'business', moduleKey: 'orders_management' },
    { path: '/modules/projects', label: 'פרויקטים', icon: Briefcase, category: 'business', moduleKey: 'projects_management' },
  ];

  const systemMenuItems: MenuItem[] = [
    { 
      path: moduleRoutes.integrations.base, 
      label: 'אינטגרציות', 
      icon: Plug, 
      category: 'system',
      moduleKey: 'integrations',
      subItems: [
        { path: moduleRoutes.integrations.googleMaps, label: 'Google Maps', icon: Plug, moduleKey: 'integrations' },
        { path: moduleRoutes.integrations.whatsapp, label: 'WhatsApp', icon: Plug, moduleKey: 'integrations' },
        { path: moduleRoutes.integrations.facebook, label: 'Facebook', icon: Plug, moduleKey: 'integrations' },
        { path: moduleRoutes.integrations.invoices, label: 'חשבוניות', icon: Plug, moduleKey: 'integrations' },
        { path: moduleRoutes.integrations.crm, label: 'CRM', icon: Plug, moduleKey: 'integrations' },
        { path: moduleRoutes.integrations.payments, label: 'תשלומים', icon: Plug, moduleKey: 'integrations' },
      ]
    },
    { 
      path: moduleRoutes.settings.base, 
      label: 'הגדרות', 
      icon: Settings, 
      category: 'system',
      // Settings is always available
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
      if (item.moduleKey && !isSuperAdmin && !modulesLoading) {
        return isModuleEnabled(item.moduleKey);
      }
      return true;
    });
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderMenuGroup = (title: string, items: MenuItem[]) => {
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
            onMenuItemClick={handleMenuItemClick}
          />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  // Show loading state only if business is loading
  if (businessLoading) {
    return (
      <Sidebar side="right" className="border-r border-border hidden md:flex">
        <SidebarHeader className="p-4 text-right">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar side="right" className="border-r border-border hidden md:flex w-64">
      <SidebarHeader className="p-4 text-right border-b">
        <h2 className="text-lg font-bold text-foreground text-right">
          {business?.name || 'ניהול מערכת'}
        </h2>
        {business && (
          <p className="text-sm text-muted-foreground text-right">
            {isSuperAdmin ? 'מנהל על' : 'משתמש עסקי'}
          </p>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <div className="space-y-6">
          {renderMenuGroup('ראשי', coreMenuItems)}
          {renderMenuGroup('עסקי', businessMenuItems)}
          {renderMenuGroup('מערכת', systemMenuItems)}
          {isSuperAdmin && renderMenuGroup('ניהול', adminMenuItems)}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 text-right border-t">
        <div className="text-xs text-muted-foreground">
          גרסה 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
