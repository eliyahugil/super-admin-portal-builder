
import React from 'react';
import { OrdersManagement } from '../orders/OrdersManagement ';
import { DeliveryManagement } from '../orders/DeliveryManagement';
import { PickupManagement } from '../orders/PickupManagement';

interface Props {
  route: string;
}

export const OrdersModuleRouter: React.FC<Props> = ({ route }) => {
  console.log('🛒 OrdersModuleRouter - Routing to:', route);
  
  switch (route) {
    case '':
    case 'main':
      return <OrdersManagement />;
    case 'delivery':
      return <DeliveryManagement />;
    case 'pickup':
      return <PickupManagement />;
    default:
      console.log('🛒 OrdersModuleRouter - Unknown route, defaulting to main');
      return <OrdersManagement />;
  }
};
