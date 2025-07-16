
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShiftTableHeader } from './table/ShiftTableHeader';
import { ShiftTableFilters } from './table/ShiftTableFilters';  
import { ShiftTableContent } from './table/ShiftTableContent';
import { ShiftTablePagination } from './table/ShiftTablePagination';
import { useShiftTableLogic } from './table/useShiftTableLogic';

interface ShiftManagementTableProps {
  businessId?: string;
}

export const ShiftManagementTable: React.FC<ShiftManagementTableProps> = ({ businessId }) => {
  const {
    shifts,
    filteredShifts,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    branchFilter,
    setBranchFilter,
    sortBy,
    sortOrder,
    handleSort,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleStatusUpdate,
    refetch,
    newShiftsCount,
    markAllAsSeen,
    isMarking
  } = useShiftTableLogic(businessId);

  console.log('🗓️ ShiftManagementTable rendering with:', {
    businessId,
    shiftsCount: shifts.length,
    filteredCount: filteredShifts.length,
    currentPage,
    loading
  });

  if (loading && shifts.length === 0) {
    return (
      <Card dir="rtl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <Card>
        <ShiftTableHeader 
          totalShifts={shifts.length}
          filteredCount={filteredShifts.length}
          newShiftsCount={newShiftsCount}
          onMarkAllAsSeen={markAllAsSeen}
        />
        
        <ShiftTableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
        />
        
        <ShiftTableContent
          shifts={filteredShifts}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onStatusUpdate={handleStatusUpdate}
          onRefetch={refetch}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </Card>

      <ShiftTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredShifts.length}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
