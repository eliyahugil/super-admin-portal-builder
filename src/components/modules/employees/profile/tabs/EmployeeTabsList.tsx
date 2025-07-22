
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
    <div className="w-full mb-8 p-4" dir="rtl" style={{paddingBottom: '40px'}}>
      <div style={{overflow: 'visible'}}>
        <div 
          className="flex flex-wrap gap-4 p-6 bg-muted/50 rounded-xl" 
          style={{
            paddingTop: '24px',
            paddingBottom: '24px',
            overflow: 'visible'
          }}
        >
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                  backgroundColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                  color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                  minHeight: '56px',
                  marginBottom: '12px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
                    e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--background))';
                    e.currentTarget.style.borderColor = 'hsl(var(--border))';
                  }
                }}
              >
                <tab.icon style={{width: '20px', height: '20px'}} />
                <span style={{fontSize: '14px', fontWeight: '600'}}>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '20px',
                    minWidth: '20px',
                    padding: '0 8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    marginLeft: '4px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : 'hsl(var(--primary))',
                    color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary-foreground))'
                  }}>
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
