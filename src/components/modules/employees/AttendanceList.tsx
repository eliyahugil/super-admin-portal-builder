
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Filter } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { RealDataView } from '@/components/ui/RealDataView';
import { useBusiness } from '@/hooks/useBusiness';

interface AttendanceRecord {
  id: string;
  recorded_at: string;
  action: string;
  is_valid_location?: boolean;
  notes?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  } | null;
  branch?: {
    name: string;
  } | null;
}

export const AttendanceList: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const { businessId, isLoading } = useBusiness();

  const { data: employees } = useRealData<any>({
    queryKey: ['employees', businessId],
    tableName: 'employees',
    select: 'id, first_name, last_name, employee_id',
    filters: businessId !== 'super_admin' ? { business_id: businessId } : {},
    orderBy: { column: 'first_name', ascending: true },
    enabled: !!businessId && !isLoading
  });

  const attendanceFilters: any = {
    ...selectedEmployee ? { employee_id: selectedEmployee } : {}
  };

  const { data: attendanceRecords, loading, error } = useRealData<AttendanceRecord>({
    queryKey: ['attendance-records', selectedDate, selectedEmployee, businessId],
    tableName: 'attendance_records',
    select: `
      *,
      employee:employees(first_name, last_name, employee_id),
      branch:branches(name)
    `,
    filters: attendanceFilters,
    orderBy: { column: 'recorded_at', ascending: false },
    enabled: !!businessId && !isLoading
  });

  // Filter by date on the frontend since Supabase timestamp filtering is complex
  const filteredRecords = attendanceRecords?.filter(record => {
    const recordDate = new Date(record.recorded_at).toISOString().split('T')[0];
    return recordDate === selectedDate;
  }) || [];

  const getActionBadge = (action: string) => {
    const variants = {
      'check_in': 'bg-green-100 text-green-800',
      'check_out': 'bg-red-100 text-red-800',
      'break_start': 'bg-yellow-100 text-yellow-800',
      'break_end': 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      'check_in': 'כניסה',
      'check_out': 'יציאה',
      'break_start': 'תחילת הפסקה',
      'break_end': 'סיום הפסקה'
    };

    return (
      <Badge className={variants[action as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">כניסות ויציאות</h1>
        <p className="text-gray-600">מעקב נוכחות עובדים ושעות עבודה</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">כל העובדים</option>
          {employees?.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name} ({employee.employee_id})
            </option>
          ))}
        </select>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          סינון נוסף
        </Button>
      </div>

      <RealDataView
        data={filteredRecords}
        loading={loading}
        error={error}
        emptyMessage="אין רישומי נוכחות לתאריך שנבחר"
        emptyIcon={<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        renderItem={(record) => (
          <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold">
                    {record.employee && `${record.employee.first_name} ${record.employee.last_name}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {record.employee?.employee_id}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(record.recorded_at).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {record.branch && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{record.branch.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {getActionBadge(record.action)}
                {record.is_valid_location !== undefined && (
                  record.is_valid_location ? (
                    <Badge className="bg-green-100 text-green-800">מיקום תקין</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">מיקום לא תקין</Badge>
                  )
                )}
              </div>
            </div>

            {record.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{record.notes}</p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};
