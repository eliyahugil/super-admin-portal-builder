
import React from 'react';
import { QuickActionsCard } from './QuickActionsCard';
import { ShiftTemplateManagementSection } from './ShiftTemplateManagementSection';
import { ManagementToolsGrid } from './ManagementToolsGrid';
import { useBusiness } from '@/hooks/useBusiness';
import { ManagementToolsSectionProps } from './types';

export const ManagementToolsSectionContainer: React.FC<ManagementToolsSectionProps> = ({
  onCreateEmployee,
  onCreateBranch
}) => {
  const { businessId } = useBusiness();

  const handleRefetch = () => {
    console.log('🔃 Refetching data...');
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Quick Actions */}
      <QuickActionsCard 
        onCreateEmployee={onCreateEmployee}
        onCreateBranch={onCreateBranch}
        selectedBusinessId={businessId}
      />

      {/* Shift Template Creator */}
      <div className="w-full">
        <ShiftTemplateManagementSection selectedBusinessId={businessId} />
      </div>

      {/* Management Tools Grid */}
      <div className="w-full">
        <ManagementToolsGrid 
          selectedBusinessId={businessId}
          onRefetch={handleRefetch}
        />
      </div>
    </div>
  );
};
