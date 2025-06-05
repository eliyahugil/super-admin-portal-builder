
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
  last_tested_at: string | null;
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
      console.log('=== updateIntegration mutation START ===');
      console.log('Business ID:', businessId);
      console.log('Integration Name:', integrationName);
      console.log('Values:', values);
      
      if (!businessId) {
        console.error('Business ID is required');
        throw new Error('Business ID is required');
      }

      const existingIntegration = businessIntegrations?.find(
        bi => bi.integration_name === integrationName
      );

      console.log('Existing integration:', existingIntegration);

      if (existingIntegration) {
        // Update existing integration
        console.log('Updating existing integration with ID:', existingIntegration.id);
        const { data, error } = await supabase
          .from('business_integrations')
          .update(values)
          .eq('id', existingIntegration.id)
          .select();

        console.log('Update result:', { data, error });
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        return data;
      } else {
        // Create new integration
        console.log('Creating new integration...');
        const integration = integrations?.find(i => i.integration_name === integrationName);
        console.log('Found integration template:', integration);
        
        if (!integration) {
          console.error('Integration template not found');
          throw new Error('Integration not found');
        }

        const insertData = {
          business_id: businessId,
          integration_name: integrationName,
          display_name: integration.display_name,
          ...values
        };
        
        console.log('Insert data:', insertData);

        const { data, error } = await supabase
          .from('business_integrations')
          .insert(insertData)
          .select();

        console.log('Insert result:', { data, error });
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('=== updateIntegration SUCCESS ===');
      console.log('Success data:', data);
      queryClient.invalidateQueries({ queryKey: ['business-integrations', businessId] });
      toast({
        title: 'הצלחה',
        description: 'האינטגרציה עודכנה בהצלחה',
      });
    },
    onError: (error) => {
      console.log('=== updateIntegration ERROR ===');
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
