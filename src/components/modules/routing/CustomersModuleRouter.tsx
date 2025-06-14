
import React from 'react';
import { CustomerManagement } from '../customers/CustomerManagement';

interface Props {
  route: string;
}
export const CustomersModuleRouter: React.FC<Props> = ({ route }) => {
  switch (route) {
    case '':
    case 'agreements':
    case 'signatures':
      return <CustomerManagement />;
    default:
      return null;
  }
};
