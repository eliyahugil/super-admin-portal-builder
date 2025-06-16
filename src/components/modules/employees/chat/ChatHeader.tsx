
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle } from 'lucide-react';
import type { Employee } from '@/types/employee';
import type { EmployeeChatGroup } from '@/types/employee-chat';

interface ChatHeaderProps {
  selectedEmployee?: Employee;
  selectedGroup?: EmployeeChatGroup;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedEmployee,
  selectedGroup,
}) => {
  return (
    <CardHeader className="border-b">
      <CardTitle className="flex items-center gap-2">
        {selectedGroup ? (
          <>
            <Users className="h-5 w-5" />
            {selectedGroup.name}
            <Badge variant="outline" className="text-xs">
              {selectedGroup.member_count} חברים
            </Badge>
          </>
        ) : selectedEmployee ? (
          <>
            <MessageCircle className="h-5 w-5" />
            צ'אט עם {selectedEmployee.first_name} {selectedEmployee.last_name}
            {selectedEmployee.phone && (
              <span className="text-sm font-normal text-gray-500">
                ({selectedEmployee.phone})
              </span>
            )}
          </>
        ) : null}
      </CardTitle>
    </CardHeader>
  );
};
