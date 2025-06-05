
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';

export const AttendanceManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const { businessId, isLoading: businessLoading } = useBusiness();

  const { data: employees } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, business_id')
        .order('first_name');

      // Filter by business_id if not super admin
      if (businessId !== 'super_admin') {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !businessLoading,
  });

  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendance-records', selectedDate, selectedEmployee, businessId],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('attendance_records')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id, business_id),
          branch:branches(name, business_id)
        `)
        .gte('recorded_at', `${selectedDate}T00:00:00`)
        .lt('recorded_at', `${selectedDate}T23:59:59`)
        .order('recorded_at', { ascending: false });

      // Filter by business_id if not super admin
      if (businessId !== 'super_admin') {
        query = query.eq('employee.business_id', businessId);
      }

      if (selectedEmployee) {
        query = query.eq('employee_id', selectedEmployee);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !businessLoading,
  });

  const getActionBadge = (action: string) => {
    const variants = {
      'clock_in': 'bg-green-100 text-green-800',
      'clock_out': 'bg-red-100 text-red-800',
      'break_start': 'bg-yellow-100 text-yellow-800',
      'break_end': 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      'clock_in': 'כניסה',
      'clock_out': 'יציאה',
      'break_start': 'תחילת הפסקה',
      'break_end': 'סיום הפסקה'
    };

    return (
      <Badge className={variants[action as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  if (businessLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול נוכחות</h1>
        <p className="text-gray-600">מעקב ניכות עובדים ושעות עבודה</p>
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

      {/* Attendance Records */}
      <div className="space-y-4">
        {attendanceRecords?.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-4">
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
                  {record.is_valid_location ? (
                    <Badge className="bg-green-100 text-green-800">מיקום תקין</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">מיקום לא תקין</Badge>
                  )}
                </div>
              </div>

              {record.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{record.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {attendanceRecords?.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין רישומי נוכחות</h3>
          <p className="text-gray-600">לא נמצאו רישומי נוכחות לתאריך שנבחר</p>
        </div>
      )}
    </div>
  );
};
