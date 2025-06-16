
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from '@/types/employee';

interface EmployeeChatSidebarProps {
  employees: Employee[];
  selectedEmployeeId: string | null;
  onEmployeeSelect: (employeeId: string) => void;
}

export const EmployeeChatSidebar: React.FC<EmployeeChatSidebarProps> = ({
  employees,
  selectedEmployeeId,
  onEmployeeSelect,
}) => {
  // Get unread message counts for each employee
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['employee-chat-unread-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_chat_messages')
        .select('employee_id, is_read')
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread counts:', error);
        return {};
      }

      // Count unread messages per employee
      const counts: Record<string, number> = {};
      data.forEach((message) => {
        counts[message.employee_id] = (counts[message.employee_id] || 0) + 1;
      });

      return counts;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          עובדים ({employees.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1 p-4">
            {employees.map((employee) => {
              const unreadCount = unreadCounts[employee.id] || 0;
              return (
                <div
                  key={employee.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEmployeeId === employee.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onEmployeeSelect(employee.id)}
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
      </CardContent>
    </Card>
  );
};
