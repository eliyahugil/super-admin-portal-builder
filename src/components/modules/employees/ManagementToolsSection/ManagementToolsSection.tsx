
import React, { useState } from 'react';
import { QuickActionsCard } from './QuickActionsCard';
import { ManagementToolsGrid } from './ManagementToolsGrid';
import { CreateEmployeeDialog } from '../CreateEmployeeDialog';
import { CreateBranchDialog } from '../CreateBranchDialog';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useBranchesData } from '@/hooks/useBranchesData';

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
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [showCreateBranch, setShowCreateBranch] = useState(false);

  // Get branches data for the employee dialog
  const { data: branches = [] } = useBranchesData(effectiveBusinessId);

  const handleCreateEmployee = () => {
    console.log('📝 Opening create employee dialog');
    setShowCreateEmployee(true);
  };

  const handleCreateBranch = () => {
    console.log('🏢 Opening create branch dialog');
    setShowCreateBranch(true);
  };

  const handleEmployeeCreated = () => {
    console.log('✅ Employee created successfully');
    setShowCreateEmployee(false);
    onRefetch();
  };

  const handleBranchCreated = () => {
    console.log('✅ Branch created successfully');
    setShowCreateBranch(false);
    onRefetch();
  };

  console.log('🔧 ManagementToolsSection rendering with businessId:', effectiveBusinessId);

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">כלי ניהול</h2>
        
        <div className="space-y-4 sm:space-y-6">
          <QuickActionsCard 
            onCreateEmployee={handleCreateEmployee}
            onCreateBranch={handleCreateBranch}
            selectedBusinessId={effectiveBusinessId}
          />
          
          <ManagementToolsGrid 
            selectedBusinessId={effectiveBusinessId}
            onRefetch={onRefetch}
          />
        </div>
      </div>

      {/* Create Employee Dialog */}
      <CreateEmployeeDialog
        open={showCreateEmployee}
        onOpenChange={setShowCreateEmployee}
        onSuccess={handleEmployeeCreated}
        branches={branches}
      />

      {/* Create Branch Dialog */}
      <CreateBranchDialog
        open={showCreateBranch}
        onOpenChange={setShowCreateBranch}
        onSuccess={handleBranchCreated}
      />
    </div>
  );
};
