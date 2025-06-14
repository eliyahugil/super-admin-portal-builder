
import React from 'react';
import { CreateShiftFormContainer } from './CreateShiftFormContainer';

interface CreateShiftFormProps {
  businessId?: string;
}

export const CreateShiftForm: React.FC<CreateShiftFormProps> = ({ businessId }) => {
  return <CreateShiftFormContainer businessId={businessId} />;
};
