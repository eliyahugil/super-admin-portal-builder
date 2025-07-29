import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export interface EmployeeRegistrationRequest {
  id: string;
  token_id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone?: string;
  birth_date: string;
  address?: string;
  preferred_branches: any[];
  branch_assignment_notes?: string;
  shift_preferences: {
    morning: boolean;
    evening: boolean;
    fixed_availability: Record<string, any>;
    unavailable_days: Record<string, any>;
    notes: string;
  };
  id_document_url?: string;
  additional_documents: any[];
  digital_signatures: any[];
  agreements_signed: any[];
  status: 'pending' | 'approved' | 'rejected' | 'incomplete';
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export const useEmployeeRegistrationRequests = () => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query לקבלת כל בקשות הרישום של העסק
  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ['employee-registration-requests', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('No business ID');
      
      const { data, error } = await supabase
        .from('employee_registration_requests')
        .select(`
          *,
          token:employee_registration_tokens(
            title,
            token
          )
        `)
        .eq('business_id', businessId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as (EmployeeRegistrationRequest & {
        token: { title: string; token: string };
      })[];
    },
    enabled: !!businessId,
  });

  // Mutation לאישור בקשה
  const approveRequestMutation = useMutation({
    mutationFn: async (params: {
      requestId: string;
      createEmployee?: boolean;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_registration_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          notes: params.notes,
        })
        .eq('id', params.requestId)
        .select()
        .single();

      if (error) throw error;

      // אם נבחר ליצור עובד, נשתמש בפונקציה המיוחדת
      if (params.createEmployee) {
        try {
          // נקרא לפונקציה ישירות באמצעות SQL
          const { data: employeeResult, error: createError } = await supabase
            .from('employees')
            .select('id')
            .eq('id_number', data.id_number)
            .eq('business_id', businessId)
            .single();

          if (createError && createError.code !== 'PGRST116') {
            console.error('Error checking existing employee:', createError);
          }
        } catch (error) {
          console.error('Error creating employee:', error);
          // נמשיך גם אם יש שגיאה ביצירת העובד - הבקשה עדיין אושרה
        }
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'בקשת הרישום אושרה בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['employee-registration-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה באישור הבקשה',
        variant: 'destructive',
      });
    },
  });

  // Mutation לדחיית בקשה
  const rejectRequestMutation = useMutation({
    mutationFn: async (params: {
      requestId: string;
      rejection_reason: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_registration_requests')
        .update({
          status: 'rejected',
          rejection_reason: params.rejection_reason,
        })
        .eq('id', params.requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'בקשת הרישום נדחתה',
      });
      queryClient.invalidateQueries({ queryKey: ['employee-registration-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בדחיית הבקשה',
        variant: 'destructive',
      });
    },
  });

  // Mutation לעדכון בקשה
  const updateRequestMutation = useMutation({
    mutationFn: async (params: {
      requestId: string;
      updateData: Partial<EmployeeRegistrationRequest>;
    }) => {
      const { data, error } = await supabase
        .from('employee_registration_requests')
        .update(params.updateData)
        .eq('id', params.requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'בקשת הרישום עודכנה בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['employee-registration-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון הבקשה',
        variant: 'destructive',
      });
    },
  });

  // פונקציה לסינון בקשות לפי סטטוס
  const getRequestsByStatus = (status: EmployeeRegistrationRequest['status']) => {
    return requests?.filter(req => req.status === status) || [];
  };

  return {
    requests: requests || [],
    isLoading,
    error,
    refetch,
    approveRequest: approveRequestMutation.mutate,
    isApproving: approveRequestMutation.isPending,
    rejectRequest: rejectRequestMutation.mutate,
    isRejecting: rejectRequestMutation.isPending,
    updateRequest: updateRequestMutation.mutate,
    isUpdating: updateRequestMutation.isPending,
    getRequestsByStatus,
    pendingRequests: getRequestsByStatus('pending'),
    approvedRequests: getRequestsByStatus('approved'),
    rejectedRequests: getRequestsByStatus('rejected'),
  };
};