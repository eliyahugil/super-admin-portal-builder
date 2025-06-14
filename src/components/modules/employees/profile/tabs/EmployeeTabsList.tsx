
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

/**
 * תצוגת טאבים רספונסיבית קומפקטית – הטאבים נשברים לשורות, רווח קטן, גובה מקסימלי, אין חפיפה עם תוכן הטאב.
 */
export const EmployeeTabsList: React.FC<EmployeeTabsListProps> = ({
  availableTabs,
  setActiveTab
}) => {
  return (
    <TabsList
      className="
        w-full flex flex-wrap justify-start gap-1 px-1 mb-1 min-w-0
        border-b border-muted bg-background max-h-20 overflow-y-auto
      "
      dir="rtl"
      style={{ direction: 'rtl' }}
    >
      {availableTabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          onClick={() => setActiveTab(tab.id)}
          // התאמות עיצוב לטאבים קומפקטיים
          className="
            relative flex items-center
            justify-end flex-row-reverse gap-1 whitespace-nowrap
            px-3 py-1.5 text-[14px] rounded-md focus:z-10 min-w-[100px] max-w-xs
            transition-colors shadow-sm
            bg-background
          "
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
