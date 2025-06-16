
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { Phone, Video, MoreVertical, Users, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Employee } from '@/types/employee';
import type { EmployeeChatGroup } from '@/types/employee-chat';

interface ChatHeaderProps {
  selectedEmployee?: Employee;
  selectedGroup?: EmployeeChatGroup;
  onOpenProfile?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedEmployee,
  selectedGroup,
  onOpenProfile,
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '??';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getLastSeen = () => {
    // Mock data - in real app this would come from user activity tracking
    return 'פעיל עכשיו';
  };

  const getMemberCount = () => {
    if (selectedGroup?.member_count) {
      return `${selectedGroup.member_count} חברים`;
    }
    return 'אין חברים';
  };

  if (!selectedEmployee && !selectedGroup) {
    return (
      <CardHeader className="border-b bg-gray-50">
        <div className="flex items-center justify-center py-4">
          <p className="text-gray-500">בחר שיחה כדי להתחיל</p>
        </div>
      </CardHeader>
    );
  }

  return (
    <CardHeader className="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative cursor-pointer" onClick={onOpenProfile}>
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`text-sm font-medium ${
              selectedEmployee 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-purple-100 text-purple-600'
            }`}>
              {selectedEmployee 
                ? getInitials(selectedEmployee.first_name, selectedEmployee.last_name)
                : selectedGroup?.name.charAt(0).toUpperCase() || 'G'
              }
            </AvatarFallback>
          </Avatar>
          
          {/* Online status for individual chats */}
          {selectedEmployee && (
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              selectedEmployee.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 cursor-pointer" onClick={onOpenProfile}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">
              {selectedEmployee 
                ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                : selectedGroup?.name
              }
            </h3>
            
            {selectedGroup && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                קבוצה
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            {selectedEmployee ? getLastSeen() : getMemberCount()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {selectedEmployee && (
            <>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onOpenProfile}>
                <Users className="h-4 w-4 mr-2" />
                {selectedEmployee ? 'פרופיל עובד' : 'פרטי קבוצה'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="h-4 w-4 mr-2" />
                חסום התראות
              </DropdownMenuItem>
              {selectedGroup && (
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  עזוב קבוצה
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
  );
};
