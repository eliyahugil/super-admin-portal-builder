
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  integration_name: string;
  display_name: string;
  description: string | null;
  category: string;
  icon: string | null;
  requires_global_key: boolean;
  requires_business_credentials: boolean;
  is_active: boolean;
}

interface BusinessIntegration {
  id: string;
  integration_name: string;
  display_name: string;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  credentials: Record<string, any>;
  config: Record<string, any>;
}

export function useIntegrations(businessId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['supported-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supported_integrations')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching supported integrations:', error);
        throw error;
      }
      return data as Integration[];
    },
  });

  const { data: businessIntegrations, isLoading: businessIntegrationsLoading } = useQuery({
    queryKey: ['business-integrations', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('business_integrations')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching business integrations:', error);
        throw error;
      }
      return data as BusinessIntegration[];
    },
    enabled: !!businessId,
  });

  const updateIntegration = useMutation({
    mutationFn: async ({ 
      integrationName, 
      values 
    }: { 
      integrationName: string; 
      values: Partial<BusinessIntegration> 
    }) => {
      if (!businessId) throw new Error('Business ID is required');

      const existingIntegration = businessIntegrations?.find(
        bi => bi.integration_name === integrationName
      );

      if (existingIntegration) {
        // Update existing integration
        const { error } = await supabase
          .from('business_integrations')
          .update(values)
          .eq('id', existingIntegration.id);

        if (error) throw error;
      } else {
        // Create new integration
        const integration = integrations?.find(i => i.integration_name === integrationName);
        if (!integration) throw new Error('Integration not found');

        const { error } = await supabase
          .from('business_integrations')
          .insert({
            business_id: businessId,
            integration_name: integrationName,
            display_name: integration.display_name,
            ...values
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-integrations', businessId] });
      toast({
        title: 'הצלחה',
        description: 'האינטגרציה עודכנה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את האינטגרציה',
        variant: 'destructive',
      });
    },
  });

  const deleteIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      const { error } = await supabase
        .from('business_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-integrations', businessId] });
      toast({
        title: 'הצלחה',
        description: 'האינטגרציה נמחקה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error deleting integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את האינטגרציה',
        variant: 'destructive',
      });
    },
  });

  return {
    integrations: integrations || [],
    businessIntegrations: businessIntegrations || [],
    updateIntegration: updateIntegration.mutate,
    deleteIntegration: deleteIntegration.mutate,
    loading: integrationsLoading || businessIntegrationsLoading,
  };
}
