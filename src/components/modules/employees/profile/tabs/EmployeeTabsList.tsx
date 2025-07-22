
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
  console.log('🏷️ EmployeeTabsList - Rendering:', {
    availableTabsCount: availableTabs.length,
    activeTab,
    isMobile: window.innerWidth < 640,
    availableTabs: availableTabs.map(t => ({ id: t.id, label: t.label }))
  });

  return (
    <div className="w-full mb-4" dir="rtl">
      {/* טאבים - תמיד גלויים בכל המסכים */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max p-2 bg-muted/30 rounded-lg">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm font-medium
                  rounded-md transition-all duration-200 whitespace-nowrap
                  shrink-0 min-w-fit
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-background text-foreground hover:bg-background/80'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    inline-flex items-center justify-center
                    h-4 min-w-4 px-1 text-xs font-medium rounded-full ml-1
                    ${isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-primary text-primary-foreground'
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
