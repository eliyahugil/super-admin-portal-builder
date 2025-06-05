
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { RealDataView } from '@/components/ui/RealDataView';
import { useBusiness } from '@/hooks/useBusiness';

type RequestStatus = 'pending' | 'approved' | 'rejected';

interface EmployeeRequestData {
  id: string;
  subject: string;
  description?: string;
  request_type: string;
  status: RequestStatus;
  created_at: string;
  review_notes?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  } | null;
}

export const EmployeeRequestsList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const { businessId, isLoading } = useBusiness();

  const requestFilters: any = {
    ...statusFilter ? { status: statusFilter } : {}
  };

  const { data: employeeRequests, loading, error } = useRealData<EmployeeRequestData>({
    queryKey: ['employee-requests', statusFilter, businessId],
    tableName: 'employee_requests',
    select: `
      *,
      employee:employees(first_name, last_name, employee_id)
    `,
    filters: requestFilters,
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!businessId && !isLoading
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    
    const labels = {
      'pending': 'ממתין',
      'approved': 'אושר',
      'rejected': 'נדחה'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const labels = {
      'vacation': 'בקשת חופשה',
      'sick_leave': 'דיווח מחלה',
      'schedule_change': 'שינוי במשמרת',
      'equipment': 'בקשת ציוד',
      'other': 'אחר'
    };

    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">בקשות עובדים</h1>
        <p className="text-gray-600">ניהול בקשות ואישורים מהעובדים</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">כל הסטטוסים</option>
          <option value="pending">ממתין לאישור</option>
          <option value="approved">אושר</option>
          <option value="rejected">נדחה</option>
        </select>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          סינון נוסף
        </Button>
      </div>

      <RealDataView
        data={employeeRequests || []}
        loading={loading}
        error={error}
        emptyMessage="אין בקשות במערכת"
        emptyIcon={<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        renderItem={(request) => (
          <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{request.subject}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {request.employee && `${request.employee.first_name} ${request.employee.last_name}`}
                    {request.employee?.employee_id && ` • ${request.employee.employee_id}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRequestTypeLabel(request.request_type)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(request.status)}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(request.created_at).toLocaleDateString('he-IL')}
                </div>
              </div>
            </div>

            {request.description && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{request.description}</p>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  אשר
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  דחה
                </Button>
              </div>
            )}

            {request.review_notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-900 mb-1">הערות ביקורת:</p>
                <p className="text-sm text-blue-800">{request.review_notes}</p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};
