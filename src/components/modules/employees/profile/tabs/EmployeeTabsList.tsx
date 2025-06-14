
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
  // Reverse tab order for RTL so first tab is at right and last tab is left.
  const tabsRtl = [...availableTabs].reverse();

  return (
    <TabsList 
      className="w-full grid grid-cols-5 lg:grid-cols-10 gap-1 mb-2 rtl:direction-rtl"
      dir="rtl"
      style={{
        direction: 'rtl'
      }}
    >
      {tabsRtl.map((tab) => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id} 
          onClick={() => setActiveTab(tab.id)}
          className="relative flex flex-row-reverse items-center justify-end gap-1 whitespace-nowrap px-2 py-1 text-[13px] rounded-md focus:z-10"
          title={tab.description}
        >
          <tab.icon className="h-4 w-4 ml-1" />
          <span className="hidden lg:inline">{tab.label}</span>
          {tab.badge && (
            <Badge variant="secondary" className="h-4 min-w-4 text-xs ltr:ml-1 rtl:mr-1">
              {tab.badge}
            </Badge>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

