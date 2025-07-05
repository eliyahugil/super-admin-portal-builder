
import { useBusiness } from '@/hooks/useBusiness';
import { useShiftScheduleData } from './hooks/useShiftScheduleData';
import { useShiftScheduleMutations } from './hooks/useShiftScheduleMutations';
import { useShiftScheduleFilters } from './hooks/useShiftScheduleFilters';
import { useShiftScheduleNavigation } from './hooks/useShiftScheduleNavigation';

export const useShiftSchedule = () => {
  const { businessId } = useBusiness();
  const { currentDate, navigateDate } = useShiftScheduleNavigation();
  const { shifts, employees, branches, loading } = useShiftScheduleData(businessId);
  const { filters, filteredShifts, updateFilters } = useShiftScheduleFilters(shifts);
  const { createShift, updateShift, deleteShift } = useShiftScheduleMutations(businessId);

  return {
    currentDate,
    shifts: filteredShifts,
    employees,
    branches,
    loading,
    filters,
    navigateDate,
    updateFilters,
    updateShift,
    deleteShift,
    createShift
  };
};
