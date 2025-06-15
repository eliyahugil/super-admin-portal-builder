
import React from 'react';
import { EmployeeDocumentsContainer } from './EmployeeDocumentsContainer';

interface Props {
  employeeId: string;
  employeeName?: string;
  canEdit?: boolean;
}

export const EmployeeDocuments: React.FC<Props> = ({
  employeeId,
  employeeName = '',
  canEdit = false
}) => {
  return (
    <EmployeeDocumentsContainer
      employeeId={employeeId}
      employeeName={employeeName}
      canEdit={canEdit}
    />
  );
};
