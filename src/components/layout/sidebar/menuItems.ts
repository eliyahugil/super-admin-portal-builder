import {
  Users, 
  User, 
  UserCheck,
  CheckSquare,
  FileText,
  Clock,
  Building,
  Calendar,
  Plug,
  Settings,
  Shield,
  Calculator,
  Package,
  ShoppingCart,
  Briefcase,
  MessageCircle,
  ListChecks,
  FolderInput,
  Send,
} from 'lucide-react';
import { getModuleRoutes } from '@/utils/routeMapping';
import { MenuItem } from './types';

export const createEmployeesMenuItems = (business: { id: string } | undefined): MenuItem[] => {
  const moduleRoutes = getModuleRoutes(business?.id);
  
  return [
    { 
      path: moduleRoutes.employees.base,
      label: 'ניהול עובדים',
      icon: Users,
      category: 'employees',
      moduleKey: 'employee_management',
      subItems: [
        { path: moduleRoutes.employees.base, label: 'רשימת עובדים', icon: Users, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.files, label: 'קבצי עובדים', icon: FileText, moduleKey: 'employee_documents' },
        { path: moduleRoutes.employees.attendance, label: 'דוח נוכחות', icon: UserCheck, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.requests, label: 'בקשות עובדים', icon: CheckSquare, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.docs, label: 'מסמכי עובדים', icon: FileText, moduleKey: 'employee_documents' },
        { path: moduleRoutes.employees.base + '/chat', label: 'צ׳אט צוות', icon: MessageCircle, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.import, label: 'ייבוא עובדים', icon: FolderInput, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.base + '/registration-tokens', label: 'טוקני הוספת עובדים', icon: Send, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.base + '/registration-requests', label: 'בקשות הוספת עובדים', icon: ListChecks, moduleKey: 'employee_management' },
        { path: moduleRoutes.employees.shifts, label: 'משמרות עובדים', icon: Clock, moduleKey: 'shift_management' },
        { path: moduleRoutes.branches.base, label: 'ניהול סניפים', icon: Building, moduleKey: 'branch_management' },
      ]
    },
    { 
      path: moduleRoutes.shifts.base, 
      label: 'ניהול משמרות', 
      icon: Clock, 
      category: 'shifts',
      moduleKey: 'shift_management',
      subItems: [
        { path: moduleRoutes.shifts.submission, label: 'הגשת משמרות', icon: Send, moduleKey: 'shift_management' },
        { path: moduleRoutes.shifts.schedule, label: 'לוח משמרות', icon: Calendar, moduleKey: 'shift_management' },
        { path: moduleRoutes.shifts.admin, label: 'כלי מנהל', icon: Settings, moduleKey: 'shift_management' },
      ]
    },
  ];
};

export const createBusinessMenuItems = (business: { id: string } | undefined): MenuItem[] => {
  const moduleRoutes = getModuleRoutes(business?.id);
  
  return [
    { path: moduleRoutes.crm.base, label: 'CRM', icon: Users, category: 'business', moduleKey: 'crm_management' },
    { path: '/modules/accounting', label: 'חשבונות ממוחשבת', icon: Calculator, category: 'business', moduleKey: 'accounting' },
    { path: '/modules/finance', label: 'כספים', icon: Calculator, category: 'business', moduleKey: 'finance_management' },
    { path: '/modules/inventory', label: 'מלאי', icon: Package, category: 'business', moduleKey: 'inventory_management' },
    { path: '/modules/orders', label: 'הזמנות', icon: ShoppingCart, category: 'business', moduleKey: 'orders_management' },
    { path: '/modules/projects', label: 'פרויקטים', icon: Briefcase, category: 'business', moduleKey: 'projects_management' },
  ];
};

export const createSystemMenuItems = (business: { id: string } | undefined): MenuItem[] => {
  const moduleRoutes = getModuleRoutes(business?.id);
  
  return [
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
        
        { path: moduleRoutes.integrations.payments, label: 'תשלומים', icon: Plug, moduleKey: 'integrations' },
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
};

export const createAdminMenuItems = (): MenuItem[] => [
  { path: '/admin', label: 'לוח בקרה', icon: Users, category: 'admin', requiresSuperAdmin: true },
  { path: '/admin/businesses', label: 'ניהול עסקים', icon: Building, category: 'admin', requiresSuperAdmin: true },
  { path: '/admin/modules', label: 'ניהול מודולים', icon: FileText, category: 'admin', requiresSuperAdmin: true },
  { path: '/admin/integrations', label: 'ניהול אינטגרציות', icon: Plug, category: 'admin', requiresSuperAdmin: true },
  { path: '/admin/system-preview', label: 'תצוגת מערכת', icon: Shield, category: 'admin', requiresSuperAdmin: true },
];
