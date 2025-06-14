
import React from 'react';
import { ManagementToolsSectionContainer } from './ManagementToolsSectionContainer';
import { ManagementToolsSectionProps } from './types';

export const ManagementToolsSection: React.FC<ManagementToolsSectionProps> = ({
  onCreateEmployee,
  onCreateBranch
}) => {
  return (
    <ManagementToolsSectionContainer 
      onCreateEmployee={onCreateEmployee}
      onCreateBranch={onCreateBranch}
    />
  );
};
