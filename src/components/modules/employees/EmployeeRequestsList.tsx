
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface EmployeeRequestData {
  id: string;
  employee_id: string;
  request_type: string;
  subject: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  employee: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

interface EmployeeRequestsListProps {
  businessId?: string;
}

export const EmployeeRequestsList: React.FC<EmployeeRequestsListProps> = ({ businessId }) => {
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['employee-requests', businessId],
    queryFn: async (): Promise<EmployeeRequestData[]> => {
      let query = supabase
        .from('employee_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, email, business_id)
        `)
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('employee.business_id', businessId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ממתין</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">אושר</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">נדחה</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת הבקשות</h3>
          <p className="text-gray-600">אנא נסה לרענן את הדף</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          בקשות עובדים
        </h1>
        <p className="text-gray-600 mt-2">רשימת כל הבקשות מעובדים</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות</h3>
            <p className="text-gray-600">עדיין לא נשלחו בקשות מעובדים</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      {request.employee.first_name} {request.employee.last_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{request.employee.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(request.status)}
                    <Badge variant="outline">
                      {request.request_type === 'time_off' ? 'חופשה' : 
                       request.request_type === 'schedule_change' ? 'שינוי משמרת' : 
                       request.request_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">נושא:</h4>
                    <p className="text-gray-700">{request.subject}</p>
                  </div>
                  
                  {request.description && (
                    <div>
                      <h4 className="font-medium mb-1">תיאור:</h4>
                      <p className="text-gray-700">{request.description}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>נשלח ב: {new Date(request.created_at).toLocaleDateString('he-IL')}</span>
                    {request.reviewed_at && (
                      <span>נבדק ב: {new Date(request.reviewed_at).toLocaleDateString('he-IL')}</span>
                    )}
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
