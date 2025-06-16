
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, Plus, MessageCircle, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmployeeChatGroups } from '@/hooks/useEmployeeChatGroups';
import { CreateGroupDialog } from './CreateGroupDialog';
import type { Employee } from '@/types/employee';
import type { EmployeeChatGroup } from '@/types/employee-chat';

interface EmployeeChatSidebarProps {
  employees: Employee[];
  selectedEmployeeId: string | null;
  selectedGroupId: string | null;
  onEmployeeSelect: (employeeId: string) => void;
  onGroupSelect: (groupId: string) => void;
}

export const EmployeeChatSidebar: React.FC<EmployeeChatSidebarProps> = ({
  employees,
  selectedEmployeeId,
  selectedGroupId,
  onEmployeeSelect,
  onGroupSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'groups'>('groups');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  console.log('👥 EmployeeChatSidebar - Employees count:', employees.length);
  console.log('👥 EmployeeChatSidebar - Selected employee:', selectedEmployeeId);
  console.log('👥 EmployeeChatSidebar - Selected group:', selectedGroupId);

  const { groups, isLoading: isLoadingGroups } = useEmployeeChatGroups();

  // Get unread message counts for each employee
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['employee-chat-unread-counts'],
    queryFn: async () => {
      console.log('🔄 Fetching unread message counts...');
      
      const { data, error } = await supabase
        .from('employee_chat_messages')
        .select('employee_id, group_id, is_read, message_type')
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error fetching unread counts:', error);
        return {};
      }

      // Count unread messages per employee and group
      const counts: Record<string, number> = {};
      data.forEach((message) => {
        if (message.message_type === 'direct' && message.employee_id) {
          const key = `employee_${message.employee_id}`;
          counts[key] = (counts[key] || 0) + 1;
        } else if (message.message_type === 'group' && message.group_id) {
          const key = `group_${message.group_id}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });

      console.log('✅ Unread counts:', counts);
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

  const getGroupTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      general: 'כללית',
      custom: 'מותאמת',
      department: 'מחלקה',
    };
    return types[type] || type;
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            צ'אט עובדים
          </CardTitle>
        </div>
        
        {/* Tab buttons */}
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'groups' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('groups')}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            קבוצות ({groups.length})
          </Button>
          <Button 
            variant={activeTab === 'employees' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('employees')}
            className="flex-1"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            ישיר ({employees.length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {activeTab === 'groups' ? (
          <>
            {/* Create Group Button */}
            <div className="p-4 border-b">
              <Button 
                onClick={() => setShowCreateGroup(true)}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                צור קבוצה חדשה
              </Button>
            </div>

            {/* Groups List */}
            {isLoadingGroups ? (
              <div className="p-4 text-center text-gray-500">
                טוען קבוצות...
              </div>
            ) : groups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                לא נמצאו קבוצות פעילות
              </div>
            ) : (
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
            )}
          </>
        ) : (
          // Employees List (Direct Messages)
          <>
            {employees.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                לא נמצאו עובדים פעילים
              </div>
            ) : (
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
            )}
          </>
        )}
      </CardContent>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        employees={employees}
      />
    </Card>
  );
};
