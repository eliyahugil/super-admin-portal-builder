import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useShiftScheduleRealtime = (businessId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    console.log('🔴 Setting up real-time subscription for scheduled_shifts:', businessId);

    const channel = supabase
      .channel('scheduled_shifts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scheduled_shifts',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('✅ Real-time: New shift inserted:', payload.new);
          
          // רענון מיידי של נתוני המשמרות
          queryClient.invalidateQueries({ 
            queryKey: ['shift-schedule-data', businessId],
            refetchType: 'active'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scheduled_shifts',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('🔄 Real-time: Shift updated:', payload.new);
          
          // רענון מיידי של נתוני המשמרות
          queryClient.invalidateQueries({ 
            queryKey: ['shift-schedule-data', businessId],
            refetchType: 'active'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'scheduled_shifts',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('🗑️ Real-time: Shift deleted:', payload.old);
          
          // רענון מיידי של נתוני המשמרות
          queryClient.invalidateQueries({ 
            queryKey: ['shift-schedule-data', businessId],
            refetchType: 'active'
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    return () => {
      console.log('🔴 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [businessId, queryClient]);
};