
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building } from 'lucide-react';
import { EmployeeManagementHeader } from './EmployeeManagementHeader';
import { EmployeeStatsCards } from './EmployeeStatsCards';
import { EmployeesTable } from './EmployeesTable';
import { EmployeeManagementLoading } from './EmployeeManagementLoading';
import { EmployeeManagementEmptyState } from './EmployeeManagementEmptyState';
import { ManagementToolsSection } from './ManagementToolsSection';
import { useEmployeeManagement } from './hooks/useEmployeeManagement';

export const EmployeeManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const branchId = searchParams.get('branch');
  const branchName = searchParams.get('branchName');
  
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
  } = useEmployeeManagement();

  // Set branch filter from URL parameters
  useEffect(() => {
    if (branchId && branchId !== selectedBranch) {
      setSelectedBranch(branchId);
    }
  }, [branchId, selectedBranch, setSelectedBranch]);

  const clearBranchFilter = () => {
    setSelectedBranch('');
    setSearchParams({});
  };

  if (isLoading) {
    return <EmployeeManagementLoading />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">שגיאה בטעינת עובדים</h2>
        <p className="text-gray-600">לא ניתן לטעון את רשימת העובדים</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      {/* Branch Filter Header */}
      {branchId && branchName && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-lg text-blue-900">
                    עובדי סניף: {decodeURIComponent(branchName)}
                  </CardTitle>
                  <p className="text-sm text-blue-700 mt-1">
                    מציג עובדים המשויכים לסניף זה בלבד
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearBranchFilter}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <ArrowLeft className="h-4 w-4 ml-1" />
                חזור לכל העובדים
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <EmployeeManagementHeader 
        onRefetch={refetch}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedEmployeeType={selectedEmployeeType}
        onEmployeeTypeChange={setSelectedEmployeeType}
        isArchived={isArchived}
        onArchivedChange={setIsArchived}
        hideFilters={!!branchId} // Hide branch filter when filtering by specific branch
      />

      <EmployeeStatsCards employees={employees} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {employees && employees.length > 0 ? (
            <EmployeesTable 
              employees={employees} 
              onRefetch={refetch}
              showBranchFilter={!branchId} // Don't show branch column when filtering by branch
            />
          ) : (
            <EmployeeManagementEmptyState onRefetch={refetch} />
          )}
        </div>
        
        <div>
          <ManagementToolsSection />
        </div>
      </div>
    </div>
  );
};
