import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useMarkAllShiftsAsSeen = (businessId?: string) => {
  const queryClient = useQueryClient();

  const markAllAsSeenMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const { data, error } = await supabase
        .rpc('mark_all_shifts_as_seen', {
          business_id_param: businessId
        });

      if (error) {
        console.error('Error marking shifts as seen:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (updatedCount) => {
      // Invalidate and refetch the shifts table data
      queryClient.invalidateQueries({ queryKey: ['shifts-table', businessId] });
      
      toast({
        title: 'הושלם בהצלחה',
        description: `${updatedCount} משמרות סומנו כנצפות`,
      });
    },
    onError: (error) => {
      console.error('Error in mark all as seen mutation:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לסמן את המשמרות כנצפות',
        variant: 'destructive',
      });
    },
  });

  return {
    markAllAsSeen: markAllAsSeenMutation.mutate,
    isMarking: markAllAsSeenMutation.isPending,
  };
};