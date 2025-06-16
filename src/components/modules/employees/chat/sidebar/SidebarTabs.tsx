
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare } from 'lucide-react';

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
    <div className="flex bg-gray-100 rounded-lg p-1">
      <Button
        variant={activeTab === 'groups' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onTabChange('groups')}
        className="flex-1 flex items-center gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        <span>קבוצות</span>
        <Badge variant="secondary" className="text-xs">
          {groupsCount}
        </Badge>
      </Button>
      
      <Button
        variant={activeTab === 'employees' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onTabChange('employees')}
        className="flex-1 flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        <span>עובדים</span>
        <Badge variant="secondary" className="text-xs">
          {employeesCount}
        </Badge>
      </Button>
    </div>
  );
};
