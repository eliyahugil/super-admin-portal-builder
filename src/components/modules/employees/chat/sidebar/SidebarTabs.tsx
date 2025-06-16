
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

interface SidebarTabsProps {
  activeTab: 'employees' | 'groups';
  onTabChange: (tab: 'employees' | 'groups') => void;
  groupsCount: number;
  employeesCount: number;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  onTabChange,
  groupsCount,
  employeesCount,
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant={activeTab === 'groups' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTabChange('groups')}
        className="flex-1"
      >
        <Users className="h-4 w-4 mr-2" />
        קבוצות ({groupsCount})
      </Button>
      <Button 
        variant={activeTab === 'employees' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTabChange('employees')}
        className="flex-1"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        ישיר ({employeesCount})
      </Button>
    </div>
  );
};
