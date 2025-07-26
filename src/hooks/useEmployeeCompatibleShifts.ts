
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompatibleShift {
  id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  branch_id: string;
  branch: {
    id: string;
    name: string;
    address?: string;
  };
  business: {
    id: string;
    name: string;
  };
  day_of_week: number;
  autoSelected?: boolean;
  reason?: string;
}

export interface DayShifts {
  dayIndex: number;
  dayName: string;
  shifts: CompatibleShift[];
  compatibleShifts: CompatibleShift[];
  autoSelectedShifts: CompatibleShift[];
  specialShifts: CompatibleShift[];
}

export interface CompatibleShiftsData {
  tokenData: {
    id: string;
    token: string;
    employeeId: string;
    weekStart: string;
    weekEnd: string;
    expiresAt: string;
    employee: any;
  };
  shiftsByDay: Record<string, DayShifts>;
  totalCompatibleShifts: number;
  totalSpecialShifts: number;
  employeeAssignments: any[];
  submittedAvailability: any[];
  optionalMorningAvailability: number[] | null;
}

export const useEmployeeCompatibleShifts = (token: string) => {
  return useQuery({
    queryKey: ['employee-compatible-shifts', token],
    queryFn: async (): Promise<CompatibleShiftsData | null> => {
      if (!token) return null;
      
      const { data, error } = await supabase.functions.invoke('get-employee-compatible-shifts', {
        body: { token }
      });

      if (error) {
        console.error('Error fetching compatible shifts:', error);
        throw new Error('שגיאה בטעינת משמרות תואמות');
      }

      return data;
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
