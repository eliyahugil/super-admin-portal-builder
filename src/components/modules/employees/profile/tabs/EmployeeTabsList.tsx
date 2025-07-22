
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
 * תצוגת טאבים רספונסיבית - פשוטה ועובדת במובייל
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
    <div className="w-full mb-6" dir="rtl">
      <div className="w-full overflow-x-auto">
        <div className="flex flex-wrap gap-2 sm:gap-3 p-4 bg-muted/30 rounded-lg min-w-fit">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3
                  text-xs sm:text-sm font-medium rounded-lg
                  transition-all duration-200 whitespace-nowrap
                  border-2 min-h-[44px] sm:min-h-[48px]
                  ${isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                    : 'bg-background text-foreground border-border hover:bg-muted hover:border-primary/50'
                  }
                `}
              >
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium">{tab.label}</span>
                {tab.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "default"}
                    className="ml-1 h-5 min-w-[20px] text-xs"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
