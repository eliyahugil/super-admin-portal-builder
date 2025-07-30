
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useShiftScheduleData } from './hooks/useShiftScheduleData';
import { useOptimizedShiftMutations } from './hooks/useOptimizedShiftMutations';
import { useShiftScheduleFilters } from './hooks/useShiftScheduleFilters';
import { useShiftScheduleNavigation } from './hooks/useShiftScheduleNavigation';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { useShiftScheduleRealtime } from '@/hooks/useShiftScheduleRealtime';

export const useShiftSchedule = () => {
  const { businessId } = useCurrentBusiness();
  const { preferences, updateViewType, updateShowNewShifts, updateFilters, updateSelectedWeek } = useViewPreferences();
  const { currentDate, selectedWeek, navigateDate, navigateWeek, setSelectedWeek } = useShiftScheduleNavigation();
  const { shifts, employees, branches, pendingSubmissions, loading, error, refetchShifts } = useShiftScheduleData(businessId);
  const { filters, filteredShifts, updateFilters: updateShiftFilters } = useShiftScheduleFilters(shifts);
  const { createShift, updateShift, deleteShift, isCreating, isUpdating, isDeleting } = useOptimizedShiftMutations(businessId);
  
  // הפעלת real-time updates למשמרות
  useShiftScheduleRealtime(businessId);

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
    preferences, // הוספת העדפות
    navigateDate,
    navigateWeek,
    setSelectedWeek: (date: Date) => {
      setSelectedWeek(date);
      updateSelectedWeek(date); // שמירת העדפת השבוע
    },
    updateFilters: (newFilters: any) => {
      updateShiftFilters(newFilters);
      updateFilters(newFilters); // שמירת העדפות הסינון
    },
    updateViewType, // פונקציה לעדכון סוג התצוגה
    updateShowNewShifts, // פונקציה לעדכון הצגת משמרות חדשות
    updateShift,
    deleteShift,
    createShift,
    businessId,
    refetchShifts
  };
};
