
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { EmployeeTabsList } from './tabs/EmployeeTabsList';
import { EmployeeTabsContent } from './tabs/EmployeeTabsContent';
import { getAvailableTabs } from './tabs/getAvailableTabs';
import type { Employee } from '@/types/employee';

interface EmployeeProfileTabsProps {
  employee: Employee;
  employeeId: string;
}

export const EmployeeProfileTabs: React.FC<EmployeeProfileTabsProps> = ({ employee, employeeId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const employeeName = `${employee.first_name} ${employee.last_name}`;
  const availableTabs = getAvailableTabs(employee);

  console.log('🏷️ EmployeeProfileTabs - Props:', {
    employeeId,
    employeeName,
    activeTab
  });

  return (
    <div className="flex-1 w-full min-h-0 overflow-visible">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <div className="w-full flex-shrink-0">
          <EmployeeTabsList 
            availableTabs={availableTabs}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>

        <div className="w-full flex-1 min-h-0 overflow-auto">
          <EmployeeTabsContent
            employee={employee}
            employeeId={employeeId}
            employeeName={employeeName}
            businessId={employee.business_id}
          />
        </div>
      </Tabs>
    </div>
  );
};
