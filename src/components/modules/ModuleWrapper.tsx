
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
import { moduleRouteMapping, parseModuleRoute } from '@/utils/moduleUtils';

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
