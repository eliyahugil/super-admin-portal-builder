
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

      {/* Desktop: Tab buttons - Multi-row layout */}
      <div
        className="
          hidden sm:block w-full mb-4
          border-b border-muted bg-background
        "
        dir="rtl"
      >
        <div className="flex flex-wrap gap-2 pb-3">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center justify-center gap-2 
                  px-4 py-2.5 text-sm rounded-lg font-medium
                  transition-all duration-200 whitespace-nowrap
                  border border-border
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md border-primary' 
                    : 'bg-background hover:bg-muted/70 text-foreground hover:border-muted-foreground/30'
                  }
                `}
                title={tab.description}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    inline-flex items-center justify-center
                    h-5 min-w-5 px-1.5 text-xs font-medium rounded-full
                    ${isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
