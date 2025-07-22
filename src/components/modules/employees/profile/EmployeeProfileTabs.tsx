
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
    <div className="flex-1 w-full">
      {/* Debug - בדיקה אם הקומפוננטה מתרנדרת */}
      <div 
        style={{
          backgroundColor: 'red',
          color: 'white',
          padding: '20px',
          margin: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: '5px solid blue',
          zIndex: 9999,
          position: 'relative'
        }}
      >
        DEBUG: EmployeeProfileTabs פועל!
        <br />
        Employee: {employeeName}
        <br />
        Active Tab: {activeTab}
        <br />
        Available Tabs: {availableTabs.length}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <EmployeeTabsList 
          availableTabs={availableTabs}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />

        <EmployeeTabsContent
          employee={employee}
          employeeId={employeeId}
          employeeName={employeeName}
          businessId={employee.business_id}
        />
      </Tabs>
    </div>
  );
};
