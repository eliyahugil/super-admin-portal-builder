
import React from 'react';
import { Button } from '@/components/ui/button';
import { Archive, ArchiveRestore, Loader2 } from 'lucide-react';
import { useGenericArchive } from '@/hooks/useGenericArchive';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface GenericArchiveButtonProps<T extends { id: string; [key: string]: any }> {
  entity: T;
  tableName: AllowedTableNames;
  entityName: string;
  queryKey: string[];
  getEntityDisplayName: (entity: T) => string;
  isArchived?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
}

export const GenericArchiveButton = <T extends { id: string; [key: string]: any }>({
  entity,
  tableName,
  entityName,
  queryKey,
  getEntityDisplayName,
  isArchived = false,
  variant = 'outline',
  size = 'sm',
  showText = true
}: GenericArchiveButtonProps<T>) => {
  const { archiveEntity, restoreEntity, isArchiving, isRestoring } = useGenericArchive({
    tableName,
    entityName,
    queryKey,
    getEntityDisplayName
  });

  const handleClick = () => {
    if (isArchived) {
      restoreEntity(entity);
    } else {
      const displayName = getEntityDisplayName(entity);
      if (confirm(`האם אתה בטוח שברצונך להעביר את ${displayName} לארכיון?`)) {
        archiveEntity(entity);
      }
    }
  };

  const isLoading = isArchiving || isRestoring;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={isArchived ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isArchived ? (
        <>
          <ArchiveRestore className="h-4 w-4" />
          {showText && <span className="mr-2">שחזר</span>}
        </>
      ) : (
        <>
          <Archive className="h-4 w-4" />
          {showText && <span className="mr-2">ארכיון</span>}
        </>
      )}
    </Button>
  );
};
