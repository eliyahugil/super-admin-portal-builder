
import React from 'react';
import { useParams } from 'react-router-dom';
import { EmployeeProfilePage } from '../employees/EmployeeProfilePage';
import { BusinessSettings } from '../settings/BusinessSettings';
import { BusinessSettingsMain } from '../settings/BusinessSettingsMain';
import { BusinessProfileEdit } from '../settings/BusinessProfileEdit';
import { UsersManagement } from '../settings/UsersManagement';
import { EmployeeManagement } from '../employees/EmployeeManagement';
import { ShiftManagement } from '../employees/ShiftManagement';
import { AttendanceManagement } from '../employees/AttendanceManagement';
import BusinessModulesPage from '../settings/BusinessModulesPage';
import { BranchManagement } from '../branches/BranchManagement';
import { BranchCreation } from '../branches/BranchCreation';
import { BranchRoles } from '../branches/BranchRoles';
import { FinanceManagement } from '../finance/FinanceManagement';
import { InventoryManagement } from '../inventory/InventoryManagement';
import { OrdersManagement } from '../orders/OrdersManagement';
import { ProjectsManagement } from '../projects/ProjectsManagement';
import { IntegrationManagement } from '../integrations/IntegrationManagement';

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
  console.log('ModuleRouteHandler - Rendering component for route:', fullRoute);

  switch (fullRoute) {
    // Settings routes
    case 'settings':
      return businessId ? <BusinessSettingsMain /> : <BusinessSettings />;
    case 'settings/main':
      return <BusinessSettingsMain />;
    case 'settings/profile':
      return <BusinessProfileEdit />;
    case 'settings/users':
      return <UsersManagement />;
    case 'settings/modules':
      return <BusinessModulesPage />;
    case 'settings/permissions':
      return <div className="p-6 text-center">רכיב הרשאות בפיתוח</div>;

    // Employee routes
    case 'employees':
      return <EmployeeManagement />;
    case 'employees/profile':
      return <EmployeeProfilePage />;
    case 'employees/attendance':
      return <AttendanceManagement />;
    case 'employees/employee-files':
      return <div className="p-6 text-center">רכיב קבצי עובדים בפיתוח</div>;
    case 'employees/employee-requests':
      return <div className="p-6 text-center">רכיב בקשות עובדים בפיתוח</div>;
    case 'employees/employee-docs':
      return <div className="p-6 text-center">רכיב מסמכים חתומים בפיתוח</div>;
    case 'employees/shifts':
      return <ShiftManagement />;
    case 'employees/import':
      return <div className="p-6 text-center">רכיב ייבוא עובדים בפיתוח</div>;

    // Branch routes
    case 'branches':
      return <BranchManagement />;
    case 'branches/create':
      return <BranchCreation />;
    case 'branches/branch-roles':
      return <BranchRoles />;

    // Shift routes
    case 'shifts':
      return <ShiftManagement />;
    case 'shifts/requests':
      return <div className="p-6 text-center">רכיב בקשות משמרת בפיתוח</div>;
    case 'shifts/approval':
      return <div className="p-6 text-center">רכיב אישור משמרות בפיתוח</div>;
    case 'shifts/schedule':
      return <div className="p-6 text-center">רכיב לוח משמרות בפיתוח</div>;
    case 'shifts/admin':
      return <div className="p-6 text-center">רכיב כלי מנהל בפיתוח</div>;
    case 'shifts/tokens':
      return <div className="p-6 text-center">רכיב טוקני הגשה בפיתוח</div>;

    // Business modules
    case 'finance':
      return <FinanceManagement />;
    case 'inventory':
      return <InventoryManagement />;
    case 'orders':
      return <OrdersManagement />;
    case 'projects':
      return <ProjectsManagement />;

    // Integration routes
    case 'integrations':
      return <IntegrationManagement />;
    case 'integrations/google-maps':
      return <div className="p-6 text-center">רכיב Google Maps בפיתוח</div>;
    case 'integrations/whatsapp':
      return <div className="p-6 text-center">רכיב WhatsApp בפיתוח</div>;
    case 'integrations/facebook':
      return <div className="p-6 text-center">רכיב Facebook בפיתוח</div>;
    case 'integrations/invoices':
      return <div className="p-6 text-center">רכיב חשבוניות בפיתוח</div>;
    case 'integrations/crm':
      return <div className="p-6 text-center">רכיב CRM בפיתוח</div>;
    case 'integrations/payments':
      return <div className="p-6 text-center">רכיב תשלומים בפיתוח</div>;

    default:
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">המודול לא נמצא</h2>
          <p>הנתיב "{fullRoute}" אינו קיים במערכת</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>נתיבים זמינים:</p>
            <ul className="list-disc list-inside mt-2">
              <li>employees, branches, shifts</li>
              <li>finance, inventory, orders, projects</li>
              <li>integrations, settings</li>
            </ul>
          </div>
        </div>
      );
  }
};
