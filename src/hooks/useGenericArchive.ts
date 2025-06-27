
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseGenericArchiveOptions {
  tableName: AllowedTableNames;
  entityName: string;
  queryKey: string[];
  getEntityDisplayName: (entity: any) => string;
  getEntityId?: (entity: any) => string;
  onSuccess?: () => void;
}

export const useGenericArchive = ({
  tableName,
  entityName,
  queryKey,
  getEntityDisplayName,
  getEntityId = (entity) => entity.id,
  onSuccess
}: UseGenericArchiveOptions) => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const queryClient = useQueryClient();

  const archiveEntity = useMutation({
    mutationFn: async (entity: any) => {
      const entityId = getEntityId(entity);
      console.log(`📁 Archiving ${entityName} with ID:`, entityId);
      
      const { data, error } = await supabase
        .from(tableName)
        .update({ is_archived: true })
        .eq('id', entityId)
        .select();

      if (error) {
        console.error(`Error archiving ${entityName}:`, error);
        throw error;
      }
      
      console.log(`✅ ${entityName} archived successfully:`, data);
      return entity;
    },
    onSuccess: (entity) => {
      const displayName = getEntityDisplayName(entity);
      
      logActivity({
        action: 'archive',
        target_type: tableName,
        target_id: getEntityId(entity),
        details: { 
          entity_name: displayName,
          entity_type: entityName
        }
      });

      toast({
        title: 'הצלחה',
        description: `${entityName} "${displayName}" הועבר לארכיון`,
      });

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Call the success callback if provided
      if (onSuccess) {
        console.log('🔄 Calling onSuccess callback after archiving');
        onSuccess();
      }
    },
    onError: (error) => {
      console.error(`Error archiving ${entityName}:`, error);
      toast({
        title: 'שגיאה',
        description: `לא ניתן להעביר את ${entityName} לארכיון`,
        variant: 'destructive',
      });
    },
  });

  const restoreEntity = useMutation({
    mutationFn: async (entity: any) => {
      const entityId = getEntityId(entity);
      console.log(`🔄 Restoring ${entityName} with ID:`, entityId);
      
      const { data, error } = await supabase
        .from(tableName)
        .update({ is_archived: false })
        .eq('id', entityId)
        .select();

      if (error) {
        console.error(`Error restoring ${entityName}:`, error);
        throw error;
      }
      
      console.log(`✅ ${entityName} restored successfully:`, data);
      return entity;
    },
    onSuccess: (entity) => {
      const displayName = getEntityDisplayName(entity);
      
      logActivity({
        action: 'restore',
        target_type: tableName,
        target_id: getEntityId(entity),
        details: { 
          entity_name: displayName,
          entity_type: entityName
        }
      });

      toast({
        title: 'הצלחה',
        description: `${entityName} "${displayName}" שוחזר מהארכיון`,
      });

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Call the success callback if provided
      if (onSuccess) {
        console.log('🔄 Calling onSuccess callback after restoring');
        onSuccess();
      }
    },
    onError: (error) => {
      console.error(`Error restoring ${entityName}:`, error);
      toast({
        title: 'שגיאה',
        description: `לא ניתן לשחזר את ${entityName} מהארכיון`,
        variant: 'destructive',
      });
    },
  });

  return {
    archiveEntity: archiveEntity.mutate,
    restoreEntity: restoreEntity.mutate,
    isArchiving: archiveEntity.isPending,
    isRestoring: restoreEntity.isPending,
  };
};
