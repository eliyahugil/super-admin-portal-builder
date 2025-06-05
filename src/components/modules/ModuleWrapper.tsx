
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
import { moduleRouteMapping, parseModuleRoute, isValidSubModule } from '@/utils/moduleRouting';

export const ModuleWrapper: React.FC = () => {
  const { moduleRoute, subModule } = useParams();
  
  if (!moduleRoute) {
    return <Navigate to="/modules" replace />;
  }

  const routeInfo = parseModuleRoute(`/modules/${moduleRoute}${subModule ? `/${subModule}` : ''}`);
  
  // Check if the module route exists in our mapping
  const moduleConfig = moduleRouteMapping[moduleRoute];
  if (!moduleConfig) {
    return <Navigate to="/modules" replace />;
  }

  // If there's a sub-module, validate it exists
  if (subModule && !isValidSubModule(moduleRoute, subModule)) {
    return <Navigate to={`/modules/${moduleRoute}`} replace />;
  }

  // Route mapping for components
  const componentMap: Record<string, React.ComponentType> = {
    // Employee modules
    'employees': EmployeeManagement,
    'employees/employee-files': EmployeeFiles,
    'employees/attendance': AttendanceManagement,
    'employees/employee-requests': EmployeeRequests,
    'employees/employee-docs': EmployeeDocs,
    'employees/shifts': ShiftManagement,
    
    // Branch modules
    'branches': BranchManagement,
    'branches/branch-roles': BranchRoles,
    
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
  };

  const routeKey = subModule ? `${moduleRoute}/${subModule}` : moduleRoute;
  const Component = componentMap[routeKey];

  if (!Component) {
    // If submodule doesn't exist, redirect to parent module
    if (subModule) {
      return <Navigate to={`/modules/${moduleRoute}`} replace />;
    }
    return <Navigate to="/modules" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Component />
    </div>
  );
};
