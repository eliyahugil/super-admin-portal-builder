
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchAccessRequests } from './accessRequestsService';
import { processAccessRequest } from './accessRequestsMutations';
import type { AccessRequestMutationParams } from './types';

export const useAccessRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['access-requests'],
    queryFn: fetchAccessRequests,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Log any errors
  if (error) {
    console.error('❌ useAccessRequests error:', error);
  }

  const handleRequestMutation = useMutation({
    mutationFn: async (params: AccessRequestMutationParams) => {
      return processAccessRequest(params, requests);
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success:', data);
      
      let title, description;
      
      if (data.action === 'approve') {
        title = 'בקשה אושרה בהצלחה';
        description = data.assignmentType 
          ? `המשתמש שויך בהצלחה ל${getAssignmentTypeLabel(data.assignmentType)}`
          : 'המשתמש קיבל גישה למערכת';
      } else {
        title = 'בקשה נדחתה';
        description = 'הבקשה נדחתה';
      }
      
      toast({
        title,
        description,
      });
      
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      queryClient.invalidateQueries({ queryKey: ['businesses-for-assignment'] });
      
      // Force refetch
      refetch();
    },
    onError: (error: any) => {
      console.error('❌ Error handling request:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעבד את הבקשה. אנא נסה שוב.',
        variant: 'destructive',
      });
    }
  });

  return {
    requests,
    isLoading,
    error,
    refetch,
    handleRequestMutation
  };
};

function getAssignmentTypeLabel(type: string): string {
  switch (type) {
    case 'existing_business': return 'עסק קיים';
    case 'new_business': return 'עסק חדש';
    case 'customer': return 'לקוח';
    case 'employee': return 'עובד';
    case 'other': return 'סוג מותאם';
    default: return 'לא מוגדר';
  }
}
