import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface ScheduleStatus {
  weekStart: string;
  weekEnd: string;
  isPublished: boolean;
  publishDate?: string;
  submissionCount: number;
}

export const useScheduleStatus = (weekStart: string, weekEnd: string) => {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['schedule-status', businessId, weekStart, weekEnd],
    queryFn: async (): Promise<ScheduleStatus> => {
      if (!businessId) {
        return {
          weekStart,
          weekEnd,
          isPublished: false,
          submissionCount: 0
        };
      }

      // Check if schedule has been published (any approved shifts for the week)
      const { data: publishedShifts, error: publishedError } = await supabase
        .from('scheduled_shifts')
        .select('id, status, updated_at')
        .eq('business_id', businessId)
        .gte('shift_date', weekStart)
        .lte('shift_date', weekEnd)
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (publishedError) {
        console.error('Error checking published schedule:', publishedError);
      }

      // Get submission count for this week
      const { data: submissions, error: submissionsError } = await supabase
        .from('shift_submissions')
        .select('id, employees!inner(business_id)')
        .eq('employees.business_id', businessId)
        .eq('week_start_date', weekStart)
        .eq('week_end_date', weekEnd);

      if (submissionsError) {
        console.error('Error getting submission count:', submissionsError);
      }

      const isPublished = publishedShifts && publishedShifts.length > 0;
      const publishDate = isPublished ? publishedShifts[0]?.updated_at : undefined;

      return {
        weekStart,
        weekEnd,
        isPublished,
        publishDate,
        submissionCount: submissions?.length || 0
      };
    },
    enabled: !!businessId && !!weekStart && !!weekEnd,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};