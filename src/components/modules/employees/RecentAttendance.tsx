
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface RecentAttendanceProps {
  employeeId: string;
}

export const RecentAttendance: React.FC<RecentAttendanceProps> = ({ employeeId }) => {
  const { data: recentAttendance, isLoading } = useQuery({
    queryKey: ['recent-attendance', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          branch:branches(name)
        `)
        .eq('employee_id', employeeId)
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'clock_in': return 'כניסה';
      case 'clock_out': return 'יציאה';
      case 'break_start': return 'התחלת הפסקה';
      case 'break_end': return 'סיום הפסקה';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'clock_in': return 'text-green-600 bg-green-50';
      case 'clock_out': return 'text-red-600 bg-red-50';
      case 'break_start': return 'text-orange-600 bg-orange-50';
      case 'break_end': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            נוכחות אחרונה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          נוכחות אחרונה
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recentAttendance || recentAttendance.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>אין רישומי נוכחות</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAttendance.map((record) => (
              <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${getActionColor(record.action)}`}>
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getActionLabel(record.action)}</span>
                    {record.branch && (
                      <span className="text-sm text-gray-500">
                        • {record.branch.name}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(record.recorded_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                  </div>
                  {record.latitude && record.longitude && (
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      GPS: {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                      {record.is_valid_location !== null && (
                        <span className={record.is_valid_location ? 'text-green-600' : 'text-red-600'}>
                          {record.is_valid_location ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  )}
                  {record.notes && (
                    <div className="text-sm text-gray-600 mt-1">{record.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
