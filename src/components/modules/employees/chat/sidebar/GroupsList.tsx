
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight } from 'lucide-react';
import type { EmployeeChatGroup } from '@/types/employee-chat';

interface GroupsListProps {
  groups: EmployeeChatGroup[];
  selectedGroupId: string | null;
  unreadCounts: Record<string, number>;
  onGroupSelect: (groupId: string) => void;
  isLoading: boolean;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  selectedGroupId,
  unreadCounts,
  onGroupSelect,
  isLoading,
}) => {
  const getGroupTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      general: 'כללית',
      custom: 'מותאמת',
      department: 'מחלקה',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        טוען קבוצות...
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        לא נמצאו קבוצות פעילות
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-1 p-4">
        {groups.map((group: EmployeeChatGroup) => {
          const unreadCount = unreadCounts[`group_${group.id}`] || 0;
          return (
            <div
              key={group.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedGroupId === group.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                console.log('👥 Selecting group:', group.id, group.name);
                onGroupSelect(group.id);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-500 text-white">
                      <Users className="h-5 w-5" />
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
                    {group.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getGroupTypeLabel(group.group_type)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {group.member_count} חברים
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                  {selectedGroupId === group.id && (
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
