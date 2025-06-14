
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
      toast({
        title: data.action === 'approve' ? 'בקשה אושרה' : 'בקשה נדחתה',
        description: data.action === 'approve' 
          ? 'המשתמש קיבל גישה לעסק'
          : 'הבקשה נדחתה',
      });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      // Force refetch
      refetch();
    },
    onError: (error: any) => {
      console.error('❌ Error handling request:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעבד את הבקשה',
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
