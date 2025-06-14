
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Building } from 'lucide-react';
import { GenericArchivedList } from '@/components/shared/GenericArchivedList';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  customer_type: string;
  is_active: boolean;
  created_at?: string;
  [key: string]: any;
}

export const ArchivedCustomersList: React.FC = () => {
  const renderCustomerCard = (customer: Customer) => {
    return (
      <>
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium text-gray-900">{customer.name}</h4>
          <Badge variant={customer.customer_type === 'business' ? 'default' : 'secondary'}>
            {customer.customer_type === 'business' ? 'עסק' : 'פרטי'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {customer.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{customer.phone}</span>
            </div>
          )}
          
          {customer.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>{customer.email}</span>
            </div>
          )}
          
          {customer.company && (
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{customer.company}</span>
            </div>
          )}
        </div>
        
        {customer.created_at && (
          <div className="text-xs text-gray-500 mt-1">
            נוצר: {new Date(customer.created_at).toLocaleDateString('he-IL')}
          </div>
        )}
      </>
    );
  };

  return (
    <GenericArchivedList
      tableName="customers"
      entityName="הלקוח"
      entityNamePlural="לקוחות"
      queryKey={['customers']}
      getEntityDisplayName={(customer) => customer.name}
      renderEntityCard={renderCustomerCard}
    />
  );
};
