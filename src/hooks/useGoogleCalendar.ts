
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';

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
  const { user } = useAuth();

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
    mutationFn: async (integration: Partial<GoogleCalendarIntegration> & { 
      google_calendar_id: string; 
      calendar_name: string; 
    }) => {
      if (!businessId) throw new Error('Business ID is required');

      if (integration.id) {
        const { data, error } = await supabase
          .from('google_calendar_integrations')
          .update({
            google_calendar_id: integration.google_calendar_id,
            calendar_name: integration.calendar_name,
            calendar_description: integration.calendar_description,
            sync_enabled: integration.sync_enabled,
            sync_direction: integration.sync_direction,
            sync_status: integration.sync_status,
            sync_error_message: integration.sync_error_message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id)
          .select();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('google_calendar_integrations')
          .insert({
            business_id: businessId,
            google_calendar_id: integration.google_calendar_id,
            calendar_name: integration.calendar_name,
            calendar_description: integration.calendar_description,
            sync_enabled: integration.sync_enabled ?? true,
            sync_direction: integration.sync_direction ?? 'bidirectional',
            sync_status: integration.sync_status ?? 'active',
            created_by: user?.id,
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
    mutationFn: async (token: Partial<GoogleOAuthToken> & { 
      access_token: string; 
    }) => {
      if (!businessId) throw new Error('Business ID is required');
      if (!user?.id) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('google_oauth_tokens')
        .upsert({
          business_id: businessId,
          user_id: user.id,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          token_expires_at: token.token_expires_at,
          scope: token.scope ?? 'https://www.googleapis.com/auth/calendar',
          updated_at: new Date().toISOString(),
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
