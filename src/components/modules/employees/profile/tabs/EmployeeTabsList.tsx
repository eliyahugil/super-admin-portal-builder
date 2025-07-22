
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
    <div className="w-full mb-6 p-2" dir="rtl">
      <div className="overflow-x-auto scrollbar-hide">
        <div 
          className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-xl" 
          style={{
            minHeight: 'auto',
            paddingBottom: '20px'
          }}
        >
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium
                  rounded-lg transition-all duration-200 whitespace-nowrap
                  shrink-0 min-w-fit
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg border-2 border-primary' 
                    : 'bg-background text-foreground hover:bg-muted border-2 border-border hover:border-primary/50'
                  }
                `}
                style={{
                  minHeight: '50px',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    inline-flex items-center justify-center
                    h-5 min-w-5 px-2 text-xs font-bold rounded-full ml-1
                    ${isActive 
                      ? 'bg-primary-foreground/30 text-primary-foreground' 
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
