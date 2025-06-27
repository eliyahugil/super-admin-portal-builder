
import React from 'react';
import { ImportToolsCard } from './ImportToolsCard';
import { QuickActionsCard } from './QuickActionsCard';
import { ShiftTemplateManagementSection } from './ShiftTemplateManagementSection';
import { DuplicateManagementCard } from './DuplicateManagementCard';
import { ManagementToolsGridProps } from './types';

export const ManagementToolsGrid: React.FC<ManagementToolsGridProps> = ({
  selectedBusinessId,
  onRefetch
}) => {
  console.log('🔧 ManagementToolsGrid rendering with selectedBusinessId:', selectedBusinessId);
  
  return (
    <div className="space-y-4" dir="rtl">
      <h3 className="text-lg font-semibold mb-4">כלי ניהול נוספים</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ImportToolsCard 
          selectedBusinessId={selectedBusinessId}
          onRefetch={onRefetch}
        />
        
        <QuickActionsCard 
          onCreateEmployee={() => console.log('Create employee')}
          onCreateBranch={() => console.log('Create branch')}
          selectedBusinessId={selectedBusinessId}
        />
        
        <DuplicateManagementCard />
        
        <ShiftTemplateManagementSection 
          selectedBusinessId={selectedBusinessId}
        />
      </div>
      
      {/* Debug info to help identify the issue */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">מידע דיבוג:</h4>
        <p className="text-sm text-blue-700">
          אתה אמור לראות כאן 4 כרטיסים: כלי ייבוא, פעולות מהירות, <strong>ניהול עובדים כפולים</strong>, וניהול תבניות משמרות.
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Business ID: {selectedBusinessId || 'לא זמין'}
        </p>
      </div>
    </div>
  );
};
