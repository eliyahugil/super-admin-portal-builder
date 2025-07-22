
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
    <div className="w-full mb-6 bg-red-100 p-4" dir="rtl" style={{minHeight: '50px', border: '2px solid red'}}>
      {/* Mobile: Horizontal scrollable tabs */}
      <div className="block sm:hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max px-4 pb-3 border-b border-muted">
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                    rounded-lg transition-all duration-200 whitespace-nowrap
                    border shrink-0 min-w-fit
                    ${isActive 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-background hover:bg-muted text-foreground border-border hover:border-muted-foreground/50'
                    }
                  `}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
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

      {/* Desktop: Multi-row wrapped tabs */}
      <div className="hidden sm:block">
        <div className="flex flex-wrap gap-2 pb-3 border-b border-muted">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                  rounded-lg transition-all duration-200 whitespace-nowrap
                  border
                  ${isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                    : 'bg-background hover:bg-muted text-foreground border-border hover:border-muted-foreground/50'
                  }
                `}
                title={tab.description}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
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
