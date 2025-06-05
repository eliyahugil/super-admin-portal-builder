
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, Clock } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { RealDataView } from '@/components/ui/RealDataView';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeRequest {
  id: string;
  subject: string;
  description?: string;
  request_type: string;
  status: string;
  created_at: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  } | null;
}

export const EmployeeRequestsApproval: React.FC = () => {
  const { businessId, isLoading } = useBusiness();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: requests, loading, error, refetch } = useRealData<EmployeeRequest>({
    queryKey: ['employee-requests-approval', businessId],
    tableName: 'employee_requests',
    select: `
      *,
      employee:employees(first_name, last_name, employee_id)
    `,
    filters: { status: 'pending' },
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!businessId && !isLoading
  });

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    
    try {
      const { error } = await supabase
        .from('employee_requests')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'current_user' // In real app, get from auth context
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: status === 'approved' ? "הבקשה אושרה בהצלחה" : "הבקשה נדחתה"
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getRequestTypeBadge = (type: string) => {
    const typeLabels = {
      'vacation': 'חופשה',
      'sick_leave': 'מחלה',
      'shift_change': 'שינוי משמרת',
      'equipment': 'ציוד',
      'other': 'אחר'
    };
    
    return (
      <Badge className="bg-blue-100 text-blue-800 rounded-lg px-2 py-1">
        {typeLabels[type as keyof typeof typeLabels] || type}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">אישור בקשות עובדים</h1>
        </div>
        <p className="text-gray-600">ניהול ואישור בקשות ממתינות של עובדים</p>
      </div>

      <RealDataView
        data={requests || []}
        loading={loading}
        error={error}
        emptyMessage="אין בקשות ממתינות לאישור כרגע"
        emptyIcon={<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        renderItem={(request) => (
          <div key={request.id} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {request.employee && `${request.employee.first_name} ${request.employee.last_name}`}
                  </h3>
                  {request.employee?.employee_id && (
                    <span className="text-sm text-gray-500">({request.employee.employee_id})</span>
                  )}
                  {getRequestTypeBadge(request.request_type)}
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2">{request.subject}</h4>
                
                {request.description && (
                  <p className="text-gray-600 text-sm mb-3">{request.description}</p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>הוגש ב-{new Date(request.created_at).toLocaleDateString('he-IL')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                onClick={() => handleStatusChange(request.id, 'approved')}
                disabled={processingId === request.id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {processingId === request.id ? 'מעבד...' : 'אשר'}
              </Button>
              
              <Button
                onClick={() => handleStatusChange(request.id, 'rejected')}
                disabled={processingId === request.id}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                {processingId === request.id ? 'מעבד...' : 'דחה'}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
};
