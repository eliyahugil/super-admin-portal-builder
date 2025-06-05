import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
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
  
  if (!moduleRoute) {
    return <Navigate to="/" replace />;
  }

  const fullRoute = `/modules/${moduleRoute}${subModule ? `/${subModule}` : ''}`;
  const routeInfo = parseModuleRoute(fullRoute);
  
  // Check if the module route exists in our mapping
  const moduleConfig = moduleRouteMapping[moduleRoute];
  if (!moduleConfig) {
    return <Navigate to="/" replace />;
  }

  // If there's a sub-module, validate it exists
  if (subModule && !isValidSubModule(moduleRoute, subModule)) {
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
    'employees/import': () => <div>Employee Import Component</div>, // Placeholder
    'employees/profile': () => <div>Employee Profile Component</div>, // Placeholder
    
    // Branch modules
    'branches': BranchManagement,
    'branches/branch-roles': BranchRoles,
    'branches/create': () => <div>Create Branch Component</div>, // Placeholder
    'branches/edit': () => <div>Edit Branch Component</div>, // Placeholder
    
    // Shift modules (dedicated shift management)
    'shifts': () => <div>Shift Overview Component</div>, // Placeholder
    'shifts/requests': () => <div>Shift Requests Component</div>, // Placeholder
    'shifts/approval': ManagementToolsSection, // Use existing approval component
    'shifts/schedule': () => <div>Shift Schedule Component</div>, // Placeholder
    'shifts/admin': ManagementToolsSection, // Use existing admin tools
    
    // Integration modules
    'integrations': IntegrationManagement,
    
    // Inventory modules
    'inventory': InventoryManagement,
    'inventory/products': ProductsManagement,
    'inventory/stock-movements': StockMovements,
    
    // Orders modules
    'orders': OrdersManagement,
    'orders/delivery': DeliveryManagement,
    'orders/pickup': PickupManagement,
    
    // Finance modules
    'finance': FinanceManagement,
    'finance/invoices': InvoicesManagement,
    'finance/payments': PaymentsManagement,
    'finance/reports': FinanceReports,
    
    // Projects modules
    'projects': ProjectsManagement,
    'projects/tasks': TasksManagement,
    
    // Settings modules
    'settings': BusinessSettings,
    'settings/profile': BusinessProfile,
    'settings/users': UsersManagement,
    'settings/permissions': PermissionsManagement,
    'settings/integrations': BusinessIntegrations,
    
    // Admin modules
    'admin': () => <div>Admin Dashboard Component</div>, // Placeholder
    'admin/businesses': () => <div>Business Management Component</div>, // Placeholder
    'admin/modules': () => <div>Module Management Component</div>, // Placeholder
    'admin/integrations': () => <div>Admin Integrations Component</div>, // Placeholder
    'admin/system-preview': () => <div>System Preview Component</div>, // Placeholder
    
    // CRM modules
    'crm': () => <div>CRM Dashboard Component</div>, // Placeholder
    'crm/leads': () => <div>CRM Leads Component</div>, // Placeholder
    'crm/franchisees': () => <div>CRM Franchisees Component</div>, // Placeholder
    'crm/wholesale': () => <div>CRM Wholesale Component</div>, // Placeholder
    'crm/events': () => <div>CRM Events Component</div>, // Placeholder
    'crm/clients': () => <div>CRM Clients Component</div>, // Placeholder
  };

  const routeKey = subModule ? `${moduleRoute}/${subModule}` : moduleRoute;
  const Component = componentMap[routeKey];

  if (!Component) {
    // If submodule doesn't exist, redirect to parent module
    if (subModule) {
      return <Navigate to={`/modules/${moduleRoute}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Component />;
};
