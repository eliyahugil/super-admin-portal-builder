
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useShiftScheduleData } from './hooks/useShiftScheduleData';
import { useShiftScheduleMutations } from './hooks/useShiftScheduleMutations';
import { useShiftScheduleFilters } from './hooks/useShiftScheduleFilters';
import { useShiftScheduleNavigation } from './hooks/useShiftScheduleNavigation';

export const useShiftSchedule = () => {
  const { businessId } = useCurrentBusiness();
  const { currentDate, selectedWeek, navigateDate, navigateWeek, setSelectedWeek } = useShiftScheduleNavigation();
  const { shifts, employees, branches, pendingSubmissions, loading, error, refetchShifts } = useShiftScheduleData(businessId);
  const { filters, filteredShifts, updateFilters } = useShiftScheduleFilters(shifts);
  const { createShift, updateShift, deleteShift, isCreating, isUpdating, isDeleting } = useShiftScheduleMutations(businessId);

  console.log('🔍 useShiftSchedule - Current state:', {
    businessId,
    shiftsCount: shifts.length,
    employeesCount: employees.length,
    branchesCount: branches.length,
    loading,
    error: error?.message || null
  });

  // Show error in loading state if there's an error
  const isLoading = loading || isCreating || isUpdating || isDeleting;

  return {
    currentDate,
    selectedWeek,
    shifts: filteredShifts,
    employees,
    branches,
    pendingSubmissions,
    loading: isLoading,
    error,
    filters,
    navigateDate,
    navigateWeek,
    setSelectedWeek,
    updateFilters,
    updateShift,
    deleteShift,
    createShift,
    businessId,
    refetchShifts
  };
};
