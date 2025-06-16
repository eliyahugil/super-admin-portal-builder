
import React, { useState, useMemo } from 'react';
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
  const [searchValue, setSearchValue] = useState('');

  console.log('👥 EmployeeChatSidebar - Employees count:', employees.length);
  console.log('👥 EmployeeChatSidebar - Selected employee:', selectedEmployeeId);
  console.log('👥 EmployeeChatSidebar - Selected group:', selectedGroupId);

  const { groups, isLoading: isLoadingGroups } = useEmployeeChatGroups();
  const { data: unreadCounts = {} } = useUnreadCounts();

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!searchValue.trim()) return employees;
    
    const searchTerm = searchValue.toLowerCase().trim();
    return employees.filter(employee => 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm) ||
      employee.email?.toLowerCase().includes(searchTerm) ||
      employee.phone?.includes(searchTerm)
    );
  }, [employees, searchValue]);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchValue.trim()) return groups;
    
    const searchTerm = searchValue.toLowerCase().trim();
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm) ||
      group.description?.toLowerCase().includes(searchTerm)
    );
  }, [groups, searchValue]);

  return (
    <Card className="w-80">
      <SidebarHeader 
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      
      <CardContent className="p-0">
        {/* Tab Navigation */}
        <div className="p-4 border-b">
          <SidebarTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            groupsCount={filteredGroups.length}
            employeesCount={filteredEmployees.length}
          />
        </div>

        {activeTab === 'groups' ? (
          <>
            {/* Auto Groups Section - only show when no search */}
            {!searchValue && (
              <div className="p-4 border-b">
                <AutoGroupsSection />
              </div>
            )}
            
            {!searchValue && (
              <CreateGroupSection onCreateGroup={() => setShowCreateGroup(true)} />
            )}
            
            <GroupsList
              groups={filteredGroups}
              selectedGroupId={selectedGroupId}
              unreadCounts={unreadCounts}
              onGroupSelect={onGroupSelect}
              isLoading={isLoadingGroups}
            />
          </>
        ) : (
          <EmployeesList
            employees={filteredEmployees}
            selectedEmployeeId={selectedEmployeeId}
            unreadCounts={unreadCounts}
            onEmployeeSelect={onEmployeeSelect}
          />
        )}

        {/* Search results indicator */}
        {searchValue && (
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              {activeTab === 'groups' 
                ? `נמצאו ${filteredGroups.length} קבוצות`
                : `נמצאו ${filteredEmployees.length} עובדים`
              }
            </p>
          </div>
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
