
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  business_id: string;
  integration_name: string;
  user_id: string | null;
  action: string;
  changes: Record<string, any> | null;
  timestamp: string;
  created_at: string;
}

export function useIntegrationAuditLog(businessId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['integration-audit-log', businessId],
    queryFn: async () => {
      console.log('Fetching audit logs for business:', businessId);
      
      if (!businessId) {
        console.log('No business ID provided, returning empty array');
        return [];
      }

      const { data, error } = await supabase
        .from('integration_audit_log')
        .select('*')
        .eq('business_id', businessId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }
      
      console.log('Fetched audit logs:', data);
      return (data || []) as AuditLogEntry[];
    },
    enabled: !!businessId,
  });

  const logAction = useMutation({
    mutationFn: async ({
      integrationName,
      action,
      changes,
      userId,
    }: {
      integrationName: string;
      action: string;
      changes?: Record<string, any>;
      userId?: string;
    }) => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      console.log('Logging audit action:', { businessId, integrationName, action, changes, userId });

      const { error } = await supabase
        .from('integration_audit_log')
        .insert({
          business_id: businessId,
          integration_name: integrationName,
          user_id: userId || null,
          action,
          changes: changes || null,
        });

      if (error) {
        console.error('Error inserting audit log:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Audit log entry created successfully');
      queryClient.invalidateQueries({ queryKey: ['integration-audit-log', businessId] });
    },
    onError: (error) => {
      console.error('Error logging audit entry:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לרשום פעולה ביומן הביקורת',
        variant: 'destructive',
      });
    },
  });

  return {
    auditLogs: auditLogs || [],
    isLoading,
    logAction: logAction.mutate,
  };
}
