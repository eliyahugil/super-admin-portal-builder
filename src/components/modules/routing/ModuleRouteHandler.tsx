
// Refactored: Delegates routing to per-domain routers

import React from 'react';
import { EmployeesModuleRouter } from './EmployeesModuleRouter';
import { SettingsModuleRouter } from './SettingsModuleRouter';
import { BranchesModuleRouter } from './BranchesModuleRouter';
import { ShiftsModuleRouter } from './ShiftsModuleRouter';
import { CustomersModuleRouter } from './CustomersModuleRouter';
import { IntegrationsModuleRouter } from './IntegrationsModuleRouter';
import { BusinessModuleRouter } from './BusinessModuleRouter';
import { DefaultModuleRouter } from './DefaultModuleRouter';

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
    case 'finance':
    case 'inventory':
    case 'orders':
    case 'projects':
      return <BusinessModuleRouter route={main} />;
    default:
      return <DefaultModuleRouter fullRoute={fullRoute} employeeId={employeeId} />;
  }
};
