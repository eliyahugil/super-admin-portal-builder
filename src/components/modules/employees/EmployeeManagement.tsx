
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
  
  // Fetch employees data
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
    error: statsError
  } = useEmployeeStats(effectiveBusinessId);

  console.log('👥 EmployeeManagement - Data state:', {
    employeesCount: employees.length,
    employeesLoading,
    employeesError: employeesError?.message,
    stats,
    statsLoading,
    statsError: statsError?.message,
    effectiveBusinessId
  });

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
            onClick={() => {
              refetchEmployees();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // Filter employees based on archived status
  const activeEmployees = employees.filter(emp => !emp.is_archived);
  const archivedEmployees = employees.filter(emp => emp.is_archived);
  const currentEmployees = showArchived ? archivedEmployees : activeEmployees;

  return (
    <div className="space-y-6">
      <EmployeeManagementHeader 
        businessId={effectiveBusinessId}
        showArchived={showArchived}
        onToggleArchived={setShowArchived}
        totalActiveEmployees={activeEmployees.length}
        totalArchivedEmployees={archivedEmployees.length}
      />

      <EmployeeStatsCards
        totalEmployees={stats.totalEmployees}
        activeEmployees={stats.activeEmployees}
        inactiveEmployees={stats.inactiveEmployees}
        archivedEmployees={stats.archivedEmployees}
        isLoading={statsLoading}
      />

      <ManagementToolsSection selectedBusinessId={effectiveBusinessId} />

      {!showArchived && activeEmployees.length === 0 ? (
        <EmployeeManagementEmptyState businessId={effectiveBusinessId} />
      ) : showArchived && archivedEmployees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">אין עובדים בארכיון</p>
        </div>
      ) : (
        <>
          {showArchived ? (
            <ArchivedEmployeesList 
              employees={archivedEmployees}
              businessId={effectiveBusinessId}
            />
          ) : (
            <EmployeesList 
              employees={activeEmployees}
              businessId={effectiveBusinessId}
            />
          )}
        </>
      )}
    </div>
  );
};
