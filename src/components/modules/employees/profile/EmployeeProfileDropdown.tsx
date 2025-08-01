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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto sm:min-w-64 justify-between bg-background text-sm sm:text-base"
              size="default"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {IconComponent && <IconComponent className="h-4 w-4 flex-shrink-0" />}
                <span className="truncate">{currentTab?.label}</span>
                {currentTab?.badge && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {currentTab.badge}
                  </Badge>
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-[calc(100vw-2rem)] sm:w-96 bg-background border shadow-lg z-50 max-h-[70vh] overflow-y-auto"
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
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <TabIcon className="h-4 w-4 flex-shrink-0" />
                    <div className="text-right min-w-0 flex-1">
                      <div className="font-medium truncate">{tab.label}</div>
                      {tab.description && (
                        <div className="text-xs text-muted-foreground truncate hidden sm:block">{tab.description}</div>
                      )}
                    </div>
                  </div>
                  {tab.badge && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {tab.badge}
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="text-sm text-muted-foreground hidden sm:block truncate">
          {currentTab?.description}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-background rounded-lg border min-h-[400px] sm:min-h-[600px] overflow-hidden">
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