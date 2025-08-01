import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { getAvailableTabs } from './tabs/getAvailableTabs';
import { EmployeeDropdownContent } from './EmployeeDropdownContent';
import type { Employee } from '@/types/employee';

interface EmployeeProfileDropdownProps {
  employee: Employee;
  employeeId: string;
}

export const EmployeeProfileDropdown: React.FC<EmployeeProfileDropdownProps> = ({ 
  employee, 
  employeeId 
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const employeeName = `${employee.first_name} ${employee.last_name}`;
  const availableTabs = getAvailableTabs(employee);
  
  const currentTab = availableTabs.find(tab => tab.id === activeSection);
  const IconComponent = currentTab?.icon;

  return (
    <div className="w-full space-y-4" dir="rtl">
      {/* Dropdown Selector */}
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-auto min-w-48 justify-between bg-background"
              size="lg"
            >
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span>{currentTab?.label}</span>
                {currentTab?.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {currentTab.badge}
                  </Badge>
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-80 bg-background border shadow-lg z-50"
          >
            {availableTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <DropdownMenuItem
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`cursor-pointer flex items-center justify-between p-3 ${
                    activeSection === tab.id ? 'bg-muted text-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className="h-4 w-4" />
                    <div className="text-right">
                      <div className="font-medium">{tab.label}</div>
                      {tab.description && (
                        <div className="text-xs text-muted-foreground">{tab.description}</div>
                      )}
                    </div>
                  </div>
                  {tab.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {tab.badge}
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="text-sm text-muted-foreground">
          {currentTab?.description}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-background rounded-lg border min-h-[600px]">
        <EmployeeDropdownContent
          employee={employee}
          employeeId={employeeId}
          employeeName={employeeName}
          businessId={employee.business_id}
          activeSection={activeSection}
        />
      </div>
    </div>
  );
};