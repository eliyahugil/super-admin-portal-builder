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
  Send
} from "lucide-react";
import { getModuleRoutes } from "@/utils/routeMapping";
import { MenuItem } from "./MainSidebarTypes";

export const buildMainSidebarMenuItems = (isSuperAdmin: boolean, business?: { id: string; name: string }) => {
  const moduleRoutes = getModuleRoutes(business?.id);

  const coreMenuItems: MenuItem[] = [
    { 
      path: moduleRoutes.employees.base, 
      label: 'עובדים', 
      icon: Users, 
      category: 'main',
      subItems: [
        { path: moduleRoutes.employees.base, label: 'רשימת עובדים', icon: Users },
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
        { path: moduleRoutes.shifts.submission, label: 'הגשת משמרות', icon: Send },
        { path: moduleRoutes.shifts.requests, label: 'בקשות משמרת', icon: CheckSquare },
        { path: moduleRoutes.shifts.approval, label: 'אישור משמרות', icon: UserCheck },
        { path: moduleRoutes.shifts.schedule, label: 'לוח משמרות', icon: Calendar },
        { path: moduleRoutes.shifts.admin, label: 'כלי מנהל', icon: Settings },
        { path: `${moduleRoutes.shifts.base}/tokens`, label: 'טוקני הגשה', icon: LinkIcon },
      ]
    },
  ];
  
  const businessMenuItems: MenuItem[] = [
    { path: moduleRoutes.crm.base, label: 'CRM', icon: Users, category: 'business' },
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

  return {
    coreMenuItems,
    businessMenuItems,
    systemMenuItems,
    adminMenuItems,
  };
};
