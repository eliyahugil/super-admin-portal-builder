
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
    <div className="space-y-6" dir="rtl">
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
        
        {/* Make sure the DuplicateManagementCard is visible */}
        <DuplicateManagementCard />
        
        <ShiftTemplateManagementSection 
          selectedBusinessId={selectedBusinessId}
        />
      </div>
      
      {/* Status indicator to help debug */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">מידע מערכת:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>✅ כרטיס כלי ייבוא</p>
          <p>✅ כרטיס פעולות מהירות</p>
          <p className="font-semibold">✅ כרטיס ניהול עובדים כפולים</p>
          <p>✅ כרטיס ניהול תבניות משמרות</p>
          <p className="mt-2">
            מזהה עסק נוכחי: {selectedBusinessId || 'לא זמין'}
          </p>
        </div>
      </div>
    </div>
  );
};
