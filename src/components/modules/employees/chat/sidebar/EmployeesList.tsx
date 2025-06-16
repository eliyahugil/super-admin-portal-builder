
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface EmployeesListProps {
  employees: Employee[];
  selectedEmployeeId: string | null;
  unreadCounts: Record<string, number>;
  onEmployeeSelect: (employeeId: string) => void;
}

export const EmployeesList: React.FC<EmployeesListProps> = ({
  employees,
  selectedEmployeeId,
  unreadCounts,
  onEmployeeSelect,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      contractor: 'קבלן',
      youth: 'נוער',
    };
    return types[type] || type;
  };

  if (employees.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        לא נמצאו עובדים פעילים
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-1 p-4">
        {employees.map((employee) => {
          const unreadCount = unreadCounts[`employee_${employee.id}`] || 0;
          return (
            <div
              key={employee.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedEmployeeId === employee.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                console.log('👤 Selecting employee:', employee.id, employee.first_name, employee.last_name);
                onEmployeeSelect(employee.id);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(employee.first_name, employee.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getEmployeeTypeLabel(employee.employee_type)}
                    </Badge>
                    {employee.phone && (
                      <span className="text-xs text-gray-500 truncate">
                        {employee.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                  {selectedEmployeeId === employee.id && (
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
