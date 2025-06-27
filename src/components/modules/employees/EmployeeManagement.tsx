
import React, { useState } from 'react';
import { EmployeeManagementHeader } from './EmployeeManagementHeader';
import { EmployeeStatsCards } from './EmployeeStatsCards';
import { EmployeeManagementLoading } from './EmployeeManagementLoading';
import { EmployeeManagementEmptyState } from './EmployeeManagementEmptyState';
import { EmployeesList } from './EmployeesList';
import { ArchivedEmployeesList } from './ArchivedEmployeesList';
import { ManagementToolsSection } from './ManagementToolsSection';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeStats } from '@/hooks/useEmployeeStats';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface EmployeeManagementProps {
  selectedBusinessId?: string | null;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ 
  selectedBusinessId 
}) => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const effectiveBusinessId = selectedBusinessId || contextBusinessId;
  
  console.log('👥 EmployeeManagement - Effective Business ID:', effectiveBusinessId);

  const [showArchived, setShowArchived] = useState(false);
  
  // Fetch employees data - NON-ARCHIVED ONLY
  const { 
    data: employees = [], 
    isLoading: employeesLoading, 
    error: employeesError,
    refetch: refetchEmployees 
  } = useEmployees(effectiveBusinessId);

  // Fetch employee statistics
  const { 
    data: stats = {
      totalEmployees: 0,
      activeEmployees: 0,
      inactiveEmployees: 0,
      archivedEmployees: 0,
    }, 
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useEmployeeStats(effectiveBusinessId);

  console.log('👥 EmployeeManagement - Data state:', {
    employeesCount: employees.length,
    employeesLoading,
    employeesError: employeesError?.message,
    stats,
    statsLoading,
    statsError: statsError?.message,
    effectiveBusinessId,
    showArchived
  });

  // Enhanced refetch function
  const handleRefetch = async () => {
    console.log('🔄 EmployeeManagement - Manual refetch triggered');
    try {
      await Promise.all([
        refetchEmployees(),
        refetchStats()
      ]);
      console.log('✅ EmployeeManagement - Refetch completed');
    } catch (error) {
      console.error('❌ EmployeeManagement - Refetch failed:', error);
    }
  };

  if (!effectiveBusinessId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">אנא בחר עסק כדי לנהל עובדים</p>
        </div>
      </div>
    );
  }

  if (employeesLoading || statsLoading) {
    return <EmployeeManagementLoading />;
  }

  if (employeesError || statsError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">
            שגיאה בטעינת נתוני העובדים: {employeesError?.message || statsError?.message}
          </p>
          <button 
            onClick={handleRefetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // The employees from useEmployees are already filtered (non-archived only)
  const activeEmployees = employees; // These are already non-archived
  const archivedEmployees: any[] = []; // We'll show this from ArchivedEmployeesList component
  const currentEmployees = showArchived ? archivedEmployees : activeEmployees;

  return (
    <div className="space-y-6">
      <EmployeeManagementHeader 
        businessId={effectiveBusinessId}
        showArchived={showArchived}
        onToggleArchived={setShowArchived}
        totalActiveEmployees={activeEmployees.length}
        totalArchivedEmployees={stats.archivedEmployees}
      />

      <EmployeeStatsCards
        totalEmployees={stats.totalEmployees}
        activeEmployees={stats.activeEmployees}
        inactiveEmployees={stats.inactiveEmployees}
        archivedEmployees={stats.archivedEmployees}
        isLoading={statsLoading}
      />

      <ManagementToolsSection 
        selectedBusinessId={effectiveBusinessId} 
        onRefetch={handleRefetch}
      />

      {!showArchived && activeEmployees.length === 0 ? (
        <EmployeeManagementEmptyState 
          businessId={effectiveBusinessId} 
          onRefetch={handleRefetch}
        />
      ) : showArchived ? (
        <ArchivedEmployeesList 
          businessId={effectiveBusinessId}
          employees={archivedEmployees}
          onRefetch={handleRefetch}
        />
      ) : (
        <EmployeesList 
          businessId={effectiveBusinessId}
          employees={activeEmployees}
          onRefetch={handleRefetch}
        />
      )}
    </div>
  );
};
