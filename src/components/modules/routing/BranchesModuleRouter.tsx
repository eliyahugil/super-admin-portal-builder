
import React from 'react';
import { BranchManagement } from '../branches/BranchManagement';
import { BranchCreation } from '../branches/BranchCreation';
import { BranchRoles } from '../branches/BranchRoles';

interface Props {
  route: string;
}
export const BranchesModuleRouter: React.FC<Props> = ({ route }) => {
  switch (route) {
    case '':
      return <BranchManagement />;
    case 'create':
      return <BranchCreation />;
    case 'branch-roles':
      return <BranchRoles />;
    default:
      return null;
  }
};
