
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseGenericArchiveProps<T = any> {
  tableName: 'employees' | 'branches' | 'customers';
  entityName: string;
  queryKey: (string | undefined | null)[];
  getEntityDisplayName: (entity: T) => string;
  onSuccess?: () => void;
}

export const useGenericArchive = <T = any>({
  tableName,
  entityName,
  queryKey,
  getEntityDisplayName,
  onSuccess
}: UseGenericArchiveProps<T>) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const archiveEntity = useMutation({
    mutationFn: async (entity: T) => {
      console.log('🗂️ Archiving entity:', entity);
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_archived: true })
        .eq('id', (entity as any).id);

      if (error) {
        console.error(`❌ Error archiving ${entityName}:`, error);
        throw error;
      }

      console.log(`✅ ${entityName} archived successfully`);
      return entity;
    },
    onSuccess: (archivedEntity) => {
      const displayName = getEntityDisplayName(archivedEntity);
      
      toast({
        title: 'הצלחה',
        description: `${entityName} ${displayName} הועבר לארכיון`,
      });

      // Invalidate multiple related queries to ensure UI updates
      console.log('🔄 Invalidating queries:', queryKey);
      queryClient.invalidateQueries({ queryKey });
      
      // Also invalidate stats queries
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error(`❌ Error archiving ${entityName}:`, error);
      toast({
        title: 'שגיאה',
        description: `לא ניתן להעביר את ${entityName} לארכיון`,
        variant: 'destructive',
      });
    },
  });

  const restoreEntity = useMutation({
    mutationFn: async (entity: T) => {
      console.log('🔄 Restoring entity:', entity);
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_archived: false })
        .eq('id', (entity as any).id);

      if (error) {
        console.error(`❌ Error restoring ${entityName}:`, error);
        throw error;
      }

      console.log(`✅ ${entityName} restored successfully`);
      return entity;
    },
    onSuccess: (restoredEntity) => {
      const displayName = getEntityDisplayName(restoredEntity);
      
      toast({
        title: 'הצלחה',
        description: `${entityName} ${displayName} שוחזר מהארכיון`,
      });

      // Invalidate multiple related queries to ensure UI updates
      console.log('🔄 Invalidating queries:', queryKey);
      queryClient.invalidateQueries({ queryKey });
      
      // Also invalidate stats queries
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error(`❌ Error restoring ${entityName}:`, error);
      toast({
        title: 'שגיאה',
        description: `לא ניתן לשחזר את ${entityName} מהארכיון`,
        variant: 'destructive',
      });
    },
  });

  return {
    archiveEntity: archiveEntity.mutate,
    isArchiving: archiveEntity.isPending,
    restoreEntity: restoreEntity.mutate,
    isRestoring: restoreEntity.isPending,
  };
};
