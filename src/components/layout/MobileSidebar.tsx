import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  LinkIcon,
} from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useBusinessModules } from '@/hooks/useBusinessModules';
import { getModuleRoutes } from '@/utils/routeMapping';
import { Skeleton } from '@/components/ui/skeleton';

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

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onOpenChange }) => {
  const { isSuperAdmin, business, isLoading: businessLoading } = useBusiness();
  const { businessId } = useBusiness();
  const { isModuleEnabled, isLoading: modulesLoading } = useBusinessModules(businessId);
  const location = useLocation();
  const currentPath = location.pathname;

  console.log('MobileSidebar - Current state:', {
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
      // Check super admin requirement
      if (item.requiresSuperAdmin && !isSuperAdmin) return false;
      
      // Check module requirement - skip module check if still loading or if super admin
      if (item.moduleKey && !isSuperAdmin && !modulesLoading) {
        return isModuleEnabled(item.moduleKey);
      }
      
      return true;
    });
  };

  const handleMenuItemClick = () => {
    onOpenChange(false);
  };

  const renderMenuSection = (title: string, items: MenuItem[]) => {
    const visibleItems = getVisibleItems(items);
    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const active = isActive(item.path);
            return (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={handleMenuItemClick}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors
                    ${active 
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <div className="w-2 h-2 bg-blue-700 rounded-full" />
                  )}
                </NavLink>
                
                {/* Sub-items */}
                {item.subItems && active && (
                  <div className="mr-4 mt-2 space-y-1">
                    {item.subItems
                      .filter(subItem => {
                        if (subItem.moduleKey && !isSuperAdmin && !modulesLoading) {
                          return isModuleEnabled(subItem.moduleKey);
                        }
                        return true;
                      })
                      .map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          onClick={handleMenuItemClick}
                          className="flex items-center gap-3 px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.label}</span>
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Show loading state if business is loading
  if (businessLoading) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
          <SheetHeader className="px-4 py-6 border-b">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </SheetHeader>
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <SheetTitle className="text-lg font-bold">
                {business?.name || 'ניהול מערכת'}
              </SheetTitle>
              {business && (
                <SheetDescription className="text-sm text-gray-500">
                  {isSuperAdmin ? 'מנהל על' : 'משתמש עסקי'}
                </SheetDescription>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              v1.0.0
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-0">
          <div className="px-0 py-4 space-y-6">
            {renderMenuSection('ראשי', coreMenuItems)}
            <Separator className="mx-4" />
            {renderMenuSection('עסקי', businessMenuItems)}
            <Separator className="mx-4" />
            {renderMenuSection('מערכת', systemMenuItems)}
            {isSuperAdmin && (
              <>
                <Separator className="mx-4" />
                {renderMenuSection('ניהול', adminMenuItems)}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
