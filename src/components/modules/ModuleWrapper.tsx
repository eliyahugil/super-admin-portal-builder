
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { EmployeeManagement } from './employees/EmployeeManagement';
import { EmployeeFiles } from './employees/EmployeeFiles';
import { AttendanceManagement } from './employees/AttendanceManagement';
import { EmployeeRequests } from './employees/EmployeeRequests';
import { EmployeeDocs } from './employees/EmployeeDocs';
import { ShiftManagement } from './employees/ShiftManagement';
import { BranchManagement } from './branches/BranchManagement';
import { BranchRoles } from './branches/BranchRoles';
import { IntegrationManagement } from './integrations/IntegrationManagement';
import { InventoryManagement } from './inventory/InventoryManagement';
import { ProductsManagement } from './inventory/ProductsManagement';
import { StockMovements } from './inventory/StockMovements';
import { OrdersManagement } from './orders/OrdersManagement';
import { DeliveryManagement } from './orders/DeliveryManagement';
import { PickupManagement } from './orders/PickupManagement';
import { FinanceManagement } from './finance/FinanceManagement';
import { InvoicesManagement } from './finance/InvoicesManagement';
import { PaymentsManagement } from './finance/PaymentsManagement';
import { FinanceReports } from './finance/FinanceReports';
import { ProjectsManagement } from './projects/ProjectsManagement';
import { TasksManagement } from './projects/TasksManagement';
import { BusinessSettings } from './settings/BusinessSettings';
import { BusinessProfile } from './settings/BusinessProfile';
import { UsersManagement } from './settings/UsersManagement';
import { PermissionsManagement } from './settings/PermissionsManagement';
import { BusinessIntegrations } from './settings/BusinessIntegrations';
import { ManagementToolsSection } from './employees/ManagementToolsSection';
import { moduleRouteMapping, parseModuleRoute, isValidSubModule } from '@/utils/moduleRouting';

export const ModuleWrapper: React.FC = () => {
  const { businessId, moduleRoute, subModule, itemId } = useParams();
  const { profile, isSuperAdmin, loading } = useAuth();
  
  console.log('ModuleWrapper - Current params:', { businessId, moduleRoute, subModule, itemId });
  console.log('ModuleWrapper - Auth state:', { profile, isSuperAdmin, loading });

  // Handle loading state
  if (loading) {
    console.log('ModuleWrapper - Still loading auth...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Handle admin routes specifically
  if (moduleRoute === 'admin' || (!moduleRoute && window.location.pathname === '/admin')) {
    console.log('ModuleWrapper - Handling admin route, isSuperAdmin:', isSuperAdmin);
    
    if (!profile) {
      console.log('ModuleWrapper - No profile found, redirecting to auth');
      return <Navigate to="/auth" replace />;
    }
    
    if (profile.role !== 'super_admin') {
      console.log('ModuleWrapper - User is not super admin, redirecting to home');
      return <Navigate to="/" replace />;
    }
    
    console.log('ModuleWrapper - Rendering SuperAdminDashboard');
    return <SuperAdminDashboard />;
  }
  
  if (!moduleRoute) {
    console.log('ModuleWrapper - No module route, redirecting to home');
    return <Navigate to="/" replace />;
  }

  const fullRoute = `/modules/${moduleRoute}${subModule ? `/${subModule}` : ''}`;
  const routeInfo = parseModuleRoute(fullRoute);
  
  // Check if the module route exists in our mapping
  const moduleConfig = moduleRouteMapping[moduleRoute];
  if (!moduleConfig) {
    console.log('ModuleWrapper - Invalid module route:', moduleRoute);
    return <Navigate to="/" replace />;
  }

  // If there's a sub-module, validate it exists
  if (subModule && !isValidSubModule(moduleRoute, subModule)) {
    console.log('ModuleWrapper - Invalid sub-module:', subModule);
    return <Navigate to={`/modules/${moduleRoute}`} replace />;
  }

  // Route mapping for components - now includes shift management components
  const componentMap: Record<string, React.ComponentType> = {
    // Employee modules
    'employees': EmployeeManagement,
    'employees/employee-files': EmployeeFiles,
    'employees/attendance': AttendanceManagement,
    'employees/employee-requests': EmployeeRequests,
    'employees/employee-docs': EmployeeDocs,
    'employees/shifts': ShiftManagement,
    'employees/import': () => <div>Employee Import Component</div>,
    'employees/profile': () => <div>Employee Profile Component</div>,
    
    'branches': BranchManagement,
    'branches/branch-roles': BranchRoles,
    'branches/create': () => <div>Create Branch Component</div>,
    'branches/edit': () => <div>Edit Branch Component</div>,
    
    'shifts': () => <div>Shift Overview Component</div>,
    'shifts/requests': () => <div>Shift Requests Component</div>,
    'shifts/approval': ManagementToolsSection,
    'shifts/schedule': () => <div>Shift Schedule Component</div>,
    'shifts/admin': ManagementToolsSection,
    
    'integrations': IntegrationManagement,
    
    'inventory': InventoryManagement,
    'inventory/products': ProductsManagement,
    'inventory/stock-movements': StockMovements,
    
    'orders': OrdersManagement,
    'orders/delivery': DeliveryManagement,
    'orders/pickup': PickupManagement,
    
    'finance': FinanceManagement,
    'finance/invoices': InvoicesManagement,
    'finance/payments': PaymentsManagement,
    'finance/reports': FinanceReports,
    
    'projects': ProjectsManagement,
    'projects/tasks': TasksManagement,
    
    'settings': BusinessSettings,
    'settings/profile': BusinessProfile,
    'settings/users': UsersManagement,
    'settings/permissions': PermissionsManagement,
    'settings/integrations': BusinessIntegrations,
    
    'admin': () => <div>Admin Dashboard Component</div>,
    'admin/businesses': () => <div>Business Management Component</div>,
    'admin/modules': () => <div>Module Management Component</div>,
    'admin/integrations': () => <div>Admin Integrations Component</div>,
    'admin/system-preview': () => <div>System Preview Component</div>,
    
    'crm': () => <div>CRM Dashboard Component</div>,
    'crm/leads': () => <div>CRM Leads Component</div>,
    'crm/franchisees': () => <div>CRM Franchisees Component</div>,
    'crm/wholesale': () => <div>CRM Wholesale Component</div>,
    'crm/events': () => <div>CRM Events Component</div>,
    'crm/clients': () => <div>CRM Clients Component</div>,
  };

  const routeKey = subModule ? `${moduleRoute}/${subModule}` : moduleRoute;
  const Component = componentMap[routeKey];

  if (!Component) {
    console.log('ModuleWrapper - No component found for route:', routeKey);
    if (subModule) {
      return <Navigate to={`/modules/${moduleRoute}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log('ModuleWrapper - Rendering component for route:', routeKey);
  return <Component />;
};
