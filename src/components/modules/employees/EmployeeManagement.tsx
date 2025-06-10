
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateEmployeeDialog } from './CreateEmployeeDialog';
import { CreateBranchDialog } from './CreateBranchDialog';
import { EmployeesList } from './EmployeesList';
import { BranchesList } from './BranchesList';
import { EmployeeExcelImporter } from './EmployeeExcelImporter';

export const EmployeeManagement = () => {
  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const { toast } = useToast();

  const { data: employees, refetch: refetchEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log('🔄 Fetching employees...');
      const { data, error } = await supabase
        .from('employees')
        .select('*, main_branch:branches(name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }
      console.log('✅ Employees fetched:', data?.length || 0);
      return data || [];
    },
  });

  const { data: branches, refetch: refetchBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }
      return data || [];
    },
  });

  // Listen for successful imports and refresh the employees list
  useEffect(() => {
    const handleEmployeesImported = () => {
      console.log('👂 Received employeesImported event, refreshing employees list...');
      refetchEmployees();
      toast({
        title: 'רשימת העובדים עודכנה',
        description: 'הנתונים החדשים מוצגים ברשימה',
      });
    };

    window.addEventListener('employeesImported', handleEmployeesImported);
    
    return () => {
      window.removeEventListener('employeesImported', handleEmployeesImported);
    };
  }, [refetchEmployees, toast]);

  const handleEmployeeCreated = () => {
    refetchEmployees();
    toast({
      title: 'הצלחה',
      description: 'העובד נוצר בהצלחה',
    });
  };

  const handleBranchCreated = () => {
    refetchBranches();
    toast({
      title: 'הצלחה',
      description: 'הסניף נוצר בהצלחה',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול עובדים וסניפים</h1>
        <p className="text-gray-600">נהל את העובדים והסניפים של העסק</p>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">עובדים</TabsTrigger>
          <TabsTrigger value="branches">סניפים</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>רשימת עובדים</CardTitle>
              <div className="flex gap-2">
                <EmployeeExcelImporter />
                <Button 
                  onClick={() => setCreateEmployeeOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  הוסף עובד
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EmployeesList employees={employees || []} onRefetch={refetchEmployees} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>רשימת סניפים</CardTitle>
              <Button 
                onClick={() => setCreateBranchOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                הוסף סניף
              </Button>
            </CardHeader>
            <CardContent>
              <BranchesList branches={branches || []} onRefetch={refetchBranches} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateEmployeeDialog
        open={createEmployeeOpen}
        onOpenChange={setCreateEmployeeOpen}
        onSuccess={handleEmployeeCreated}
        branches={branches || []}
      />

      <CreateBranchDialog
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        onSuccess={handleBranchCreated}
      />
    </div>
  );
};
