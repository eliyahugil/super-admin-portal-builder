
import React from 'react';
import { useEmployeeFiles } from './files/hooks/useEmployeeFiles';
import { EmployeeFilesHeader } from './files/components/EmployeeFilesHeader';
import { EmployeeFilesFilters } from './files/components/EmployeeFilesFilters';
import { EmployeeFilesStats } from './files/components/EmployeeFilesStats';
import { EmployeeFilesGroup } from './files/components/EmployeeFilesGroup';
import { EmployeeFilesEmptyState } from './files/components/EmployeeFilesEmptyState';

export const EmployeeFilesManagement: React.FC = () => {
  const {
    filters,
    setFilters,
    groupedFiles,
    isLoading,
    expandedEmployees,
    toggleEmployeeExpansion,
    handleDownload,
    clearFilters,
  } = useEmployeeFiles();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <EmployeeFilesHeader />
      
      <EmployeeFilesFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      <EmployeeFilesStats groupedFiles={groupedFiles} />

      <div className="space-y-4">
        {groupedFiles.map((group) => (
          <EmployeeFilesGroup
            key={group.employee.id}
            group={group}
            isExpanded={expandedEmployees.has(group.employee.id)}
            onToggleExpansion={toggleEmployeeExpansion}
            onDownload={handleDownload}
          />
        ))}
      </div>

      {groupedFiles.length === 0 && (
        <EmployeeFilesEmptyState filters={filters} />
      )}
    </div>
  );
};
