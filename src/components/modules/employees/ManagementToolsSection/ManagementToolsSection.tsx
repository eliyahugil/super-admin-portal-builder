
import React from 'react';
import { QuickActionsCard } from './QuickActionsCard';
import { ManagementToolsGrid } from './ManagementToolsGrid';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface ManagementToolsSectionProps {
  onRefetch: () => void;
  selectedBusinessId?: string | null;
}

export const ManagementToolsSection: React.FC<ManagementToolsSectionProps> = ({
  onRefetch,
  selectedBusinessId
}) => {
  const { businessId } = useCurrentBusiness();
  const effectiveBusinessId = selectedBusinessId || businessId;

  const handleCreateEmployee = () => {
    // This will be handled by the parent component
    console.log('Create employee clicked');
  };

  const handleCreateBranch = () => {
    // This will be handled by the parent component
    console.log('Create branch clicked');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-xl font-semibold mb-4">כלי ניהול</h2>
        
        <div className="space-y-4">
          <QuickActionsCard 
            onCreateEmployee={handleCreateEmployee}
            onCreateBranch={handleCreateBranch}
          />
          
          <ManagementToolsGrid businessId={effectiveBusinessId} />
        </div>
      </div>
    </div>
  );
};
