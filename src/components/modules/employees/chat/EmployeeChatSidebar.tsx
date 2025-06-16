
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEmployeeChatGroups } from '@/hooks/useEmployeeChatGroups';
import { CreateGroupDialog } from './CreateGroupDialog';
import { AutoGroupsSection } from './AutoGroupsSection';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarTabs } from './sidebar/SidebarTabs';
import { CreateGroupSection } from './sidebar/CreateGroupSection';
import { GroupsList } from './sidebar/GroupsList';
import { EmployeesList } from './sidebar/EmployeesList';
import { useUnreadCounts } from './sidebar/useUnreadCounts';
import type { Employee } from '@/types/employee';

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
  const { data: unreadCounts = {} } = useUnreadCounts();

  return (
    <Card className="w-80">
      <SidebarHeader />
      
      <CardContent className="p-0">
        {/* Tab Navigation */}
        <div className="p-4 border-b">
          <SidebarTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            groupsCount={groups.length}
            employeesCount={employees.length}
          />
        </div>

        {activeTab === 'groups' ? (
          <>
            {/* Auto Groups Section */}
            <div className="p-4 border-b">
              <AutoGroupsSection />
            </div>
            
            <CreateGroupSection onCreateGroup={() => setShowCreateGroup(true)} />
            <GroupsList
              groups={groups}
              selectedGroupId={selectedGroupId}
              unreadCounts={unreadCounts}
              onGroupSelect={onGroupSelect}
              isLoading={isLoadingGroups}
            />
          </>
        ) : (
          <EmployeesList
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            unreadCounts={unreadCounts}
            onEmployeeSelect={onEmployeeSelect}
          />
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
