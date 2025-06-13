
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { EmployeeTabsList } from './tabs/EmployeeTabsList';
import { EmployeeTabsContent } from './tabs/EmployeeTabsContent';
import { getAvailableTabs } from './tabs/getAvailableTabs';
import type { Employee } from '@/types/supabase';

interface EmployeeProfileTabsProps {
  employee: Employee;
  employeeId: string;
}

export const EmployeeProfileTabs: React.FC<EmployeeProfileTabsProps> = ({ 
  employee, 
  employeeId 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { businessId } = useCurrentBusiness();
  const availableTabs = getAvailableTabs(employee);
  const employeeName = `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="md:w-2/3">
      <Tabs defaultValue={activeTab} className="w-full">
        <EmployeeTabsList 
          availableTabs={availableTabs}
          setActiveTab={setActiveTab}
        />

        <EmployeeTabsContent
          employee={employee}
          employeeId={employeeId}
          employeeName={employeeName}
          businessId={businessId || employee.business_id}
        />
      </Tabs>
    </div>
  );
};
