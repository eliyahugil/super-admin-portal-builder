
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
  
  const [showArchived, setShowArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch employees data - זה כבר מחזיר רק עובדים פעילים
  const { 
    data: activeEmployees = [], 
    isLoading: employeesLoading, 
    error: employeesError,
    refetch: refetchEmployees 
  } = useEmployees(effectiveBusinessId);

  console.log('📊 EmployeeManagement - Employee data:', {
    activeEmployees: activeEmployees.length,
    showArchived,
    refreshKey
  });

  // Fetch employee statistics
  const { 
    data: stats = {
      totalEmployees: 0,
      activeEmployees: 0,
      inactiveEmployees: 0,
      archivedEmployees: 0,
    }, 
    isLoading: statsLoading,
    refetch: refetchStats
  } = useEmployeeStats(effectiveBusinessId);

  const handleRefetch = async () => {
    console.log('🔄 Manual refetch triggered - incrementing refresh key');
    setRefreshKey(prev => prev + 1);
    await Promise.all([
      refetchEmployees(),
      refetchStats()
    ]);
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

  if (employeesError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">שגיאה בטעינת נתוני העובדים</p>
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

  return (
    <div className="space-y-6" key={refreshKey}>
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
          employees={[]}
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
