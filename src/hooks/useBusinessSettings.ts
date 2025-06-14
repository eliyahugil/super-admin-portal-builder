
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessSettings {
  id: string;
  business_id: string;
  auto_shift_reminders: boolean;
  reminder_day: string;
  reminder_hour: number;
  use_whatsapp_api: boolean;
  created_at: string;
  updated_at: string;
  // New fields for employee management general settings
  allow_employee_reporting_web: boolean;
  require_employee_gps: boolean;
  require_employee_image: boolean;
  allow_shift_editing: boolean;
  allow_past_shift_editing: boolean;
  allow_shift_submission_without_token: boolean;
}

export const useBusinessSettings = (businessId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['business-settings', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching business settings:', error);
        throw error;
      }

      return data as BusinessSettings | null;
    },
    enabled: !!businessId,
  });

  const updateSettings = useMutation({
    mutationFn: async (settingsData: Partial<BusinessSettings>) => {
      if (!businessId) throw new Error('Business ID is required');

      // Check if settings exist
      if (settings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('business_settings')
          .update({
            ...settingsData,
            updated_at: new Date().toISOString(),
          })
          .eq('business_id', businessId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('business_settings')
          .insert({
            business_id: businessId,
            ...settingsData,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      toast({
        title: 'הגדרות נשמרו',
        description: 'הגדרות העסק עודכנו בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating business settings:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון ההגדרות',
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};
