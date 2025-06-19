
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GoogleCalendarIntegration {
  id: string;
  business_id: string;
  google_calendar_id: string;
  calendar_name: string;
  calendar_description?: string;
  sync_enabled: boolean;
  sync_direction: 'import_only' | 'export_only' | 'bidirectional';
  last_sync_at?: string;
  sync_status: 'active' | 'paused' | 'error';
  sync_error_message?: string;
  created_at: string;
}

export interface GoogleOAuthToken {
  id: string;
  business_id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  scope: string;
}

export interface GoogleCalendarEvent {
  id: string;
  business_id: string;
  google_event_id: string;
  google_calendar_id: string;
  employee_id?: string;
  branch_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  location?: string;
  attendees: any[];
  status: 'tentative' | 'confirmed' | 'cancelled';
  sync_direction: 'imported' | 'exported' | 'bidirectional';
}

export function useGoogleCalendar(businessId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['google-calendar-integrations', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('google_calendar_integrations')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Google Calendar integrations:', error);
        throw error;
      }
      return data as GoogleCalendarIntegration[];
    },
    enabled: !!businessId,
  });

  const { data: oauthTokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['google-oauth-tokens', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('google_oauth_tokens')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Google OAuth tokens:', error);
        throw error;
      }
      return data as GoogleOAuthToken[];
    },
    enabled: !!businessId,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['google-calendar-events', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('google_calendar_events')
        .select('*')
        .eq('business_id', businessId)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching Google Calendar events:', error);
        throw error;
      }
      return data as GoogleCalendarEvent[];
    },
    enabled: !!businessId,
  });

  const saveIntegration = useMutation({
    mutationFn: async (integration: Partial<GoogleCalendarIntegration>) => {
      if (!businessId) throw new Error('Business ID is required');

      if (integration.id) {
        const { data, error } = await supabase
          .from('google_calendar_integrations')
          .update(integration)
          .eq('id', integration.id)
          .select();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('google_calendar_integrations')
          .insert({
            ...integration,
            business_id: businessId,
          })
          .select();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-integrations', businessId] });
      toast({
        title: 'הצלחה',
        description: 'אינטגרציית Google Calendar נשמרה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error saving Google Calendar integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את אינטגרציית Google Calendar',
        variant: 'destructive',
      });
    },
  });

  const saveOAuthToken = useMutation({
    mutationFn: async (token: Partial<GoogleOAuthToken>) => {
      if (!businessId) throw new Error('Business ID is required');

      const { data, error } = await supabase
        .from('google_oauth_tokens')
        .upsert({
          ...token,
          business_id: businessId,
        }, { 
          onConflict: 'business_id,user_id'
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-oauth-tokens', businessId] });
      toast({
        title: 'הצלחה',
        description: 'אסימון Google OAuth נשמר בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error saving Google OAuth token:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את אסימון Google OAuth',
        variant: 'destructive',
      });
    },
  });

  const syncCalendar = useMutation({
    mutationFn: async (integrationId: string) => {
      // This would typically call an edge function to perform the sync
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: { integrationId, businessId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-events', businessId] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-integrations', businessId] });
      toast({
        title: 'הצלחה',
        description: 'סנכרון Google Calendar הושלם בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error syncing Google Calendar:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לסנכרן את Google Calendar',
        variant: 'destructive',
      });
    },
  });

  return {
    integrations: integrations || [],
    oauthTokens: oauthTokens || [],
    events: events || [],
    loading: integrationsLoading || tokensLoading || eventsLoading,
    saveIntegration: saveIntegration.mutate,
    saveOAuthToken: saveOAuthToken.mutate,
    syncCalendar: syncCalendar.mutate,
    isSaving: saveIntegration.isPending || saveOAuthToken.isPending,
    isSyncing: syncCalendar.isPending,
  };
}
