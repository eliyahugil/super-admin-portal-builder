
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateCustomerDialog } from './CreateCustomerDialog';
import { CustomersList } from './CustomersList';
import { CustomerAgreements } from './CustomerAgreements';
import { DigitalSignatures } from './DigitalSignatures';

export const CustomerManagement = () => {
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const { toast } = useToast();

  const { data: customers, refetch: refetchCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('🔄 Fetching customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching customers:', error);
        throw error;
      }
      console.log('✅ Customers fetched:', data?.length || 0);
      return data || [];
    },
  });

  const { data: agreements } = useQuery({
    queryKey: ['customer-agreements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_agreements')
        .select('*, customer:customers(name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching agreements:', error);
        throw error;
      }
      return data || [];
    },
  });

  const handleCustomerCreated = () => {
    refetchCustomers();
    toast({
      title: 'הצלחה',
      description: 'הלקוח נוצר בהצלחה',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול לקוחות</h1>
        <p className="text-gray-600">נהל את הלקוחות, ההסכמים והחתימות הדיגיטליות</p>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">לקוחות</TabsTrigger>
          <TabsTrigger value="agreements">הסכמים</TabsTrigger>
          <TabsTrigger value="signatures">חתימות דיגיטליות</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>רשימת לקוחות</CardTitle>
              <Button 
                onClick={() => setCreateCustomerOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                הוסף לקוח
              </Button>
            </CardHeader>
            <CardContent>
              <CustomersList customers={customers || []} onRefetch={refetchCustomers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreements">
          <Card>
            <CardHeader>
              <CardTitle>ניהול הסכמים</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerAgreements 
                agreements={agreements || []} 
                customers={customers || []} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures">
          <Card>
            <CardHeader>
              <CardTitle>חתימות דיגיטליות</CardTitle>
            </CardHeader>
            <CardContent>
              <DigitalSignatures agreements={agreements || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateCustomerDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
};
