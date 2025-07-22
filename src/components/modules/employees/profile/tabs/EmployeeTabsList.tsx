
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
    <div className="w-full mb-4" dir="rtl">
      <div className="w-full overflow-x-auto overflow-y-visible pb-2">
        <div className="flex flex-nowrap gap-2 p-3 bg-muted/30 rounded-lg" style={{ minWidth: 'max-content' }}>
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2.5
                  text-xs font-medium rounded-md
                  transition-all duration-200 whitespace-nowrap
                  border min-h-[40px] flex-shrink-0
                  ${isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                    : 'bg-background text-foreground border-border hover:bg-muted/50'
                  }
                `}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-xs">{tab.label}</span>
                {tab.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "default"}
                    className="ml-1 h-4 min-w-[16px] text-[10px] px-1"
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
