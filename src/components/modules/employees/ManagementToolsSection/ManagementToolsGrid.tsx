
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
  return (
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
  );
};
