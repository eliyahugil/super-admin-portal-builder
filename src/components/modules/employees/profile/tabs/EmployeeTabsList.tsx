
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
  activeTab?: string;
}

/**
 * תצוגת טאבים רספונסיבית קומפקטית – הטאבים נשברים לשורות, רווח קטן, גובה מקסימלי, אין חפיפה עם תוכן הטאב.
 */
export const EmployeeTabsList: React.FC<EmployeeTabsListProps> = ({
  availableTabs,
  setActiveTab,
  activeTab = 'overview'
}) => {
  return (
    <div className="w-full">
      {/* Mobile: Dropdown selector */}
      <div className="block sm:hidden mb-4">
        <select 
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm"
          dir="rtl"
        >
          {availableTabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label} {tab.badge ? `(${tab.badge})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Tab buttons */}
      <TabsList
        className="
          hidden sm:flex w-full flex-wrap justify-start gap-1 px-1 mb-1 min-w-0
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
            className="
              relative flex items-center
              justify-end flex-row-reverse gap-2 whitespace-nowrap
              px-3 py-2 text-sm rounded-md focus:z-10 min-w-[120px] max-w-xs
              transition-colors shadow-sm
              bg-background hover:bg-muted/50
              data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
            "
            title={tab.description}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
            {tab.badge && (
              <Badge variant="secondary" className="h-4 min-w-4 text-xs shrink-0">
                {tab.badge}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};
