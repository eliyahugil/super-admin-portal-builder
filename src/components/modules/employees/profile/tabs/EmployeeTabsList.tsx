
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
  // לא לבצע reverse - לשמור את הסדר כפי שהוגדר
  return (
    <TabsList 
      className="w-full flex overflow-x-auto rtl:flex-row-reverse gap-2 px-1 mb-2 min-w-0"
      dir="rtl"
      style={{ direction: 'rtl' }}
    >
      {availableTabs.map((tab) => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id} 
          onClick={() => setActiveTab(tab.id)}
          className="relative flex flex-row-reverse items-center justify-end gap-1 whitespace-nowrap px-3 py-2 text-[14px] rounded-md focus:z-10 min-w-[110px] max-w-xs"
          title={tab.description}
        >
          <tab.icon className="h-4 w-4 ml-1 shrink-0" />
          <span className="hidden lg:inline truncate">{tab.label}</span>
          {tab.badge && (
            <Badge variant="secondary" className="h-4 min-w-4 text-xs ltr:ml-1 rtl:mr-1 shrink-0">
              {tab.badge}
            </Badge>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

