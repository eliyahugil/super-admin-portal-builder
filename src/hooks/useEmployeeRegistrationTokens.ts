import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export interface EmployeeRegistrationToken {
  id: string;
  business_id: string;
  token: string;
  title: string;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  max_registrations?: number;
  current_registrations: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useEmployeeRegistrationTokens = () => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query לקבלת כל הטוקנים של העסק
  const { data: tokens, isLoading, error, refetch } = useQuery({
    queryKey: ['employee-registration-tokens', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('No business ID');
      
      const { data, error } = await supabase
        .from('employee_registration_tokens')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmployeeRegistrationToken[];
    },
    enabled: !!businessId,
  });

  // Mutation ליצירת טוקן חדש
  const createTokenMutation = useMutation({
    mutationFn: async (tokenData: {
      title: string;
      description?: string;
      expires_at?: string;
      max_registrations?: number;
    }) => {
      if (!businessId) throw new Error('No business ID');
      
      // יצירת טוקן ייחודי
      const token = `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('employee_registration_tokens')
        .insert({
          business_id: businessId,
          token,
          title: tokenData.title,
          description: tokenData.description,
          expires_at: tokenData.expires_at,
          max_registrations: tokenData.max_registrations,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'טוקן הוספת עובדים נוצר בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['employee-registration-tokens'] });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה ביצירת הטוקן',
        variant: 'destructive',
      });
    },
  });

  // Mutation לעדכון טוקן
  const updateTokenMutation = useMutation({
    mutationFn: async (params: {
      tokenId: string;
      updates: Partial<Pick<EmployeeRegistrationToken, 'title' | 'description' | 'is_active' | 'expires_at' | 'max_registrations'>>;
    }) => {
      const { data, error } = await supabase
        .from('employee_registration_tokens')
        .update(params.updates)
        .eq('id', params.tokenId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'הטוקן עודכן בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['employee-registration-tokens'] });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון הטוקן',
        variant: 'destructive',
      });
    },
  });

  // Mutation למחיקת טוקן
  const deleteTokenMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('employee_registration_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'הטוקן נמחק בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['employee-registration-tokens'] });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה במחיקת הטוקן',
        variant: 'destructive',
      });
    },
  });

  // פונקציה לקבלת URL ציבורי לטוקן
  const getPublicTokenUrl = (token: string) => {
    return `${window.location.origin}/register-employee?token=${token}`;
  };

  return {
    tokens: tokens || [],
    isLoading,
    error,
    refetch,
    createToken: createTokenMutation.mutate,
    isCreating: createTokenMutation.isPending,
    updateToken: updateTokenMutation.mutate,
    isUpdating: updateTokenMutation.isPending,
    deleteToken: deleteTokenMutation.mutate,
    isDeleting: deleteTokenMutation.isPending,
    getPublicTokenUrl,
  };
};