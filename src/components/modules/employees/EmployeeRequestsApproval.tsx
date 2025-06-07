import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface EmployeeRequest {
  id: string;
  employee_id: string;
  request_type: string;
  subject: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  employee: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

export const EmployeeRequestsApproval: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['employee-requests-approval'],
    queryFn: async (): Promise<EmployeeRequest[]> => {
      const { data, error } = await supabase
        .from('employee_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('employee_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'בקשה אושרה',
        description: 'הבקשה אושרה בהצלחה',
      });

      queryClient.invalidateQueries({ queryKey: ['employee-requests-approval'] });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לאשר את הבקשה',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('employee_requests')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'בקשה נדחתה',
        description: 'הבקשה נדחתה',
      });

      queryClient.invalidateQueries({ queryKey: ['employee-requests-approval'] });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לדחות את הבקשה',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          אישור בקשות עובדים
        </h1>
        <p className="text-gray-600 mt-2">סקור ואשר בקשות מעובדים</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות ממתינות</h3>
            <p className="text-gray-600">כל הבקשות טופלו</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {request.employee.first_name} {request.employee.last_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{request.employee.email}</p>
                  </div>
                  <Badge variant="secondary">
                    {request.request_type === 'time_off' ? 'חופשה' : 
                     request.request_type === 'schedule_change' ? 'שינוי משמרת' : 
                     request.request_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">נושא:</h4>
                    <p className="text-gray-700">{request.subject}</p>
                  </div>
                  
                  {request.description && (
                    <div>
                      <h4 className="font-medium mb-2">תיאור:</h4>
                      <p className="text-gray-700">{request.description}</p>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    נשלח ב: {new Date(request.created_at).toLocaleDateString('he-IL')}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => handleApprove(request.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      אשר
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      דחה
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
