
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string | number;
  description?: string;
}

interface EmployeeTabsListProps {
  availableTabs: TabItem[];
  setActiveTab: (tab: string) => void;
}

export const EmployeeTabsList: React.FC<EmployeeTabsListProps> = ({
  availableTabs,
  setActiveTab
}) => {
  return (
    <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
      {availableTabs.map((tab) => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id} 
          onClick={() => setActiveTab(tab.id)}
          className="relative"
          title={tab.description}
        >
          <div className="flex items-center space-x-1">
            <tab.icon className="h-4 w-4" />
            <span className="hidden lg:inline">{tab.label}</span>
            {tab.badge && (
              <Badge variant="secondary" className="h-4 min-w-4 text-xs">
                {tab.badge}
              </Badge>
            )}
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
