
import React from 'react';
import { GenericArchiveButton } from '@/components/shared/GenericArchiveButton';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  customer_type: string;
  is_active: boolean;
  [key: string]: any;
}

interface CustomerArchiveButtonProps {
  customer: Customer;
  isArchived?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

export const CustomerArchiveButton: React.FC<CustomerArchiveButtonProps> = ({
  customer,
  isArchived = false,
  variant = 'outline',
  size = 'sm'
}) => {
  return (
    <GenericArchiveButton
      entity={customer}
      tableName="customers"
      entityName="הלקוח"
      queryKey={['customers']}
      getEntityDisplayName={(cust) => cust.name}
      isArchived={isArchived}
      variant={variant}
      size={size}
    />
  );
};
