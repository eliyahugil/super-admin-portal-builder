
import { useEffect } from 'react';
import { 
  useShiftTableData,
  useShiftTableFilters,
  useShiftTableSorting,
  useShiftTablePagination,
  useShiftTableActions,
  useMarkAllShiftsAsSeen
} from './hooks';

export const useShiftTableLogic = (businessId?: string) => {
  console.log('🔄 useShiftTableLogic initializing with businessId:', businessId);

  // Data fetching
  const { shifts, loading, refetch } = useShiftTableData(businessId);

  // Filtering
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    branchFilter,
    setBranchFilter,
    filteredShifts
  } = useShiftTableFilters(shifts);

  // Sorting
  const {
    sortBy,
    sortOrder,
    handleSort,
    sortedShifts
  } = useShiftTableSorting(filteredShifts);

  // Pagination
  const {
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    paginatedShifts
  } = useShiftTablePagination(sortedShifts);

  // Actions
  const { handleStatusUpdate } = useShiftTableActions(refetch);
  const { markAllAsSeen, isMarking } = useMarkAllShiftsAsSeen(businessId);

  // Calculate new shifts count
  const newShiftsCount = shifts.filter(shift => shift.is_new).length;

  // Reset page when filters change
  useEffect(() => {
    handlePageChange(1);
  }, [searchTerm, statusFilter, dateFilter, branchFilter, handlePageChange]);

  return {
    shifts,
    filteredShifts: paginatedShifts,
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
  };
};
