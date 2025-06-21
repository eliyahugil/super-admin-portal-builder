
import React from 'react';
import { EmployeesList } from './EmployeesList';
import { EmployeeManagementHeader } from './EmployeeManagementHeader';
import { EmployeeManagementLoading } from './EmployeeManagementLoading';
import { EmployeeManagementEmptyState } from './EmployeeManagementEmptyState';
import { EmployeeStatsCards } from './EmployeeStatsCards';
import { ManagementToolsSection } from './ManagementToolsSection/ManagementToolsSection';
import { ArchivedEmployeesList } from './ArchivedEmployeesList';
import { useEmployeeManagement } from './hooks/useEmployeeManagement';
import { useBranchesData } from '@/hooks/useBranchesData';

interface EmployeeManagementProps {
  selectedBusinessId?: string | null;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ selectedBusinessId }) => {
  console.log('👥 EmployeeManagement rendering with selectedBusinessId:', selectedBusinessId);
  
  const {
    employees,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedBranch,
    setSelectedBranch,
    selectedEmployeeType,
    setSelectedEmployeeType,
    isArchived,
    setIsArchived,
  } = useEmployeeManagement(selectedBusinessId);

  const { data: branches = [] } = useBranchesData(selectedBusinessId);

  console.log('📋 EmployeeManagement rendering with:', {
    selectedBusinessId,
    employeesCount: employees.length,
    isArchived,
    branchesCount: branches.length
  });

  if (isLoading) {
    return <EmployeeManagementLoading />;
  }

  if (error) {
    console.error('❌ Error in EmployeeManagement:', error);
    return (
      <div className="text-center py-8" dir="rtl">
        <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת העובדים</h3>
        <p className="text-gray-600 mb-4">אנא נסה לרענן את הדף</p>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <EmployeeManagementHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedEmployeeType={selectedEmployeeType}
        onEmployeeTypeChange={setSelectedEmployeeType}
        isArchived={isArchived}
        onArchivedChange={setIsArchived}
        branches={branches}
        onRefetch={refetch}
        selectedBusinessId={selectedBusinessId}
      />

      {!isArchived && (
        <>
          <EmployeeStatsCards employees={employees} />
          
          {/* Management Tools Section - Make it prominent */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">כלי ניהול מתקדמים</h2>
            <ManagementToolsSection 
              onRefetch={refetch} 
              selectedBusinessId={selectedBusinessId}
            />
          </div>
        </>
      )}

      {employees.length === 0 ? (
        isArchived ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין עובדים מאורכבים</h3>
            <p className="text-gray-600">לא נמצאו עובדים מאורכבים במערכת</p>
          </div>
        ) : (
          <EmployeeManagementEmptyState onRefetch={refetch} />
        )
      ) : isArchived ? (
        <ArchivedEmployeesList 
          employees={employees} 
          onRefetch={refetch}
          branches={branches}
        />
      ) : (
        <EmployeesList 
          employees={employees} 
          onRefetch={refetch}
          branches={branches}
        />
      )}
    </div>
  );
};
