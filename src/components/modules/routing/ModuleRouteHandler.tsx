
// Refactored: Delegates routing to per-domain routers

import React from 'react';
import { EmployeesModuleRouter } from './EmployeesModuleRouter';
import { SettingsModuleRouter } from './SettingsModuleRouter';
import { BranchesModuleRouter } from './BranchesModuleRouter';
import { ShiftsModuleRouter } from './ShiftsModuleRouter';
import { CustomersModuleRouter } from './CustomersModuleRouter';
import { IntegrationsModuleRouter } from './IntegrationsModuleRouter';
import { BusinessModuleRouter } from './BusinessModuleRouter';
import { OrdersModuleRouter } from './OrdersModuleRouter';
import { DefaultModuleRouter } from './DefaultModuleRouter';
import { CRMDashboard } from '@/components/crm/CRMDashboard';

interface ModuleRouteHandlerProps {
  fullRoute: string;
  employeeId?: string;
  businessId?: string;
}

export const ModuleRouteHandler: React.FC<ModuleRouteHandlerProps> = ({
  fullRoute,
  employeeId,
  businessId
}) => {
  // fullRoute could be nested: e.g., "employees/employee-files"
  const [main, ...restArr] = fullRoute.split('/');
  const route = restArr.join('/');

  console.log('🔀 ModuleRouteHandler - Processing:', { main, route, fullRoute });

  switch (main) {
    case 'employees':
      return <EmployeesModuleRouter route={route} employeeId={employeeId} businessId={businessId} />;
    case 'settings':
      return <SettingsModuleRouter route={route} businessId={businessId} />;
    case 'branches':
      return <BranchesModuleRouter route={route} />;
    case 'shifts':
      return <ShiftsModuleRouter route={route} />;
    case 'customers':
      return <CustomersModuleRouter route={route} />;
    case 'integrations':
      return <IntegrationsModuleRouter route={route} />;
    case 'crm':
      return <CRMDashboard />;
    case 'orders':
      return <OrdersModuleRouter route={route} />;
    case 'accounting':
    case 'finance':
    case 'inventory':
    case 'projects':
      return <BusinessModuleRouter route={main} />;
    default:
      return <DefaultModuleRouter fullRoute={fullRoute} employeeId={employeeId} />;
  }
};
