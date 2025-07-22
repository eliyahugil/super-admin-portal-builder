
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
    <div 
      className="w-full mb-4 bg-red-500 text-white p-4" 
      dir="rtl" 
      style={{ 
        minHeight: '100px',
        fontSize: '16px',
        fontWeight: 'bold',
        border: '5px solid blue',
        position: 'relative',
        zIndex: 9999
      }}
    >
      <div>בדיקה - אם אתה רואה את זה, הקומפוננטה עובדת!</div>
      <div>מספר טאבים: {availableTabs.length}</div>
      <div>טאב פעיל: {activeTab}</div>
      
      {/* הטאבים עצמם */}
      <div className="mt-4">
        {availableTabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-block',
                margin: '5px',
                padding: '10px 15px',
                backgroundColor: isActive ? '#000' : '#fff',
                color: isActive ? '#fff' : '#000',
                border: '2px solid #000',
                borderRadius: '5px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {tab.label} ({index + 1})
            </button>
          );
        })}
      </div>
    </div>
  );
};
