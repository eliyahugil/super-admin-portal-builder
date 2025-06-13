
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/types/customers';

interface CustomersListProps {
  customers: Customer[];
  onRefetch: () => void;
}

export const CustomersList: React.FC<CustomersListProps> = ({ 
  customers, 
  onRefetch 
}) => {
  const { toast } = useToast();

  const getCustomerTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      individual: 'לקוח פרטי',
      business: 'עסק',
    };
    return types[type] || type;
  };

  const getCustomerTypeIcon = (type: string) => {
    return type === 'business' ? Building : User;
  };

  const handleEdit = (customer: Customer) => {
    console.log('=== EDIT CUSTOMER ===');
    console.log('Customer:', customer);
    
    toast({
      title: 'עריכה',
      description: 'פונקציונליות עריכה תמומש בקרוב',
    });
  };

  const handleDelete = async (customerId: string, customerName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${customerName}"?`)) {
      return;
    }

    try {
      console.log('=== DELETING CUSTOMER ===');
      console.log('Customer ID:', customerId);
      console.log('Customer Name:', customerName);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        console.error('Error deleting customer:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן למחוק את הלקוח',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: 'הלקוח נמחק בהצלחה',
      });

      onRefetch();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה',
        variant: 'destructive',
      });
    }
  };

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין לקוחות</h3>
        <p className="text-gray-600">התחל על ידי הוספת הלקוח הראשון שלך</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => {
        const IconComponent = getCustomerTypeIcon(customer.customer_type);
        
        return (
          <div
            key={customer.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <IconComponent className="h-5 w-5 text-gray-400" />
                <h3 className="font-medium text-gray-900">{customer.name}</h3>
                <Badge variant="outline">
                  {getCustomerTypeLabel(customer.customer_type)}
                </Badge>
                {!customer.is_active && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    לא פעיל
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {customer.email && (
                  <div>אימייל: {customer.email}</div>
                )}
                {customer.phone && (
                  <div>טלפון: {customer.phone}</div>
                )}
                {customer.contact_person && (
                  <div>איש קשר: {customer.contact_person}</div>
                )}
                <div>נוצר: {new Date(customer.created_at).toLocaleDateString('he-IL')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEdit(customer)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(customer.id, customer.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
