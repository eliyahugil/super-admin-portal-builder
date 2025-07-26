
import React from 'react';
import { AccountingSystem } from '../accounting/AccountingSystem';
import { FinanceManagement } from '../finance/FinanceManagement';
import { InventoryManagement } from '../inventory/InventoryManagement';
import { OrdersManagement } from '../orders/OrdersManagement';
import { ProjectsManagement } from '../projects/ProjectsManagement';

interface Props {
  route: string;
}
export const BusinessModuleRouter: React.FC<Props> = ({ route }) => {
  switch (route) {
    case 'accounting':
      return <AccountingSystem />;
    case 'finance':
      return <FinanceManagement />;
    case 'inventory':
      return <InventoryManagement />;
    case 'orders':
      return <OrdersManagement />;
    case 'projects':
      return <ProjectsManagement />;
    default:
      return null;
  }
};
