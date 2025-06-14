
import React from 'react';
import { GenericArchiveButton } from '@/components/shared/GenericArchiveButton';
import type { Branch } from '@/types/branch';

interface BranchArchiveButtonProps {
  branch: Branch;
  isArchived?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

export const BranchArchiveButton: React.FC<BranchArchiveButtonProps> = ({
  branch,
  isArchived = false,
  variant = 'outline',
  size = 'sm'
}) => {
  return (
    <GenericArchiveButton
      entity={branch}
      tableName="branches"
      entityName="הסניף"
      queryKey={['branches']}
      getEntityDisplayName={(br) => br.name}
      isArchived={isArchived}
      variant={variant}
      size={size}
    />
  );
};
