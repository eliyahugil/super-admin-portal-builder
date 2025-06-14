
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface ArchiveableEntity {
  id: string;
  [key: string]: any;
}

interface UseGenericArchiveOptions {
  tableName: 'employees' | 'branches' | 'customers';
  entityName: string;
  queryKey: string[];
  getEntityDisplayName: (entity: ArchiveableEntity) => string;
  getEntityId?: (entity: ArchiveableEntity) => string;
}

export const useGenericArchive = <T extends ArchiveableEntity>({
  tableName,
  entityName,
  queryKey,
  getEntityDisplayName,
  getEntityId = (entity) => entity.id
}: UseGenericArchiveOptions) => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const queryClient = useQueryClient();

  const archiveEntity = useMutation({
    mutationFn: async (entity: T) => {
      const { error } = await supabase
        .from(tableName as any)
        .update({ is_archived: true })
        .eq('id', getEntityId(entity));

      if (error) throw error;
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

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey });
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
    mutationFn: async (entity: T) => {
      const { error } = await supabase
        .from(tableName as any)
        .update({ is_archived: false })
        .eq('id', getEntityId(entity));

      if (error) throw error;
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

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey });
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
