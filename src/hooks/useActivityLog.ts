import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export interface ActivityLogEntry {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  user_id: string;
  created_at: string;
}

export const useActivityLog = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);

  // Fetch activity logs
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['activity-logs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ActivityLogEntry[];
    },
    enabled: !!user,
    refetchInterval: 30000, // רענון כל 30 שניות
  });

  useEffect(() => {
    if (activityData) {
      setActivities(activityData);
    }
  }, [activityData]);

  // Real-time subscription for new activities
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          const newActivity = payload.new as ActivityLogEntry;
          setActivities(prev => [newActivity, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Log a new activity
  const logActivity = async (action: string, targetType: string, targetId: string, details?: any) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          action,
          target_type: targetType,
          target_id: targetId,
          details: details || {},
          user_id: user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return {
    activities,
    isLoading,
    logActivity
  };
};