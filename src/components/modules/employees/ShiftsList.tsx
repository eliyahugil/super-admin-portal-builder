
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { RealDataView } from '@/components/ui/RealDataView';
import { useBusiness } from '@/hooks/useBusiness';

interface ShiftData {
  id: string;
  shift_date: string;
  is_assigned: boolean;
  notes?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  } | null;
  shift_template?: {
    name: string;
    start_time: string;
    end_time: string;
    shift_type: string;
    branch?: {
      name: string;
    } | null;
  } | null;
}

export const ShiftsList: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { businessId, isLoading } = useBusiness();

  const { data: shifts, loading, error, refetch } = useRealData<ShiftData>({
    queryKey: ['scheduled-shifts', selectedDate, businessId],
    tableName: 'scheduled_shifts',
    select: `
      *,
      employee:employees(first_name, last_name, employee_id),
      shift_template:shift_templates(
        name,
        start_time,
        end_time,
        shift_type,
        branch:branches(name)
      )
    `,
    filters: { shift_date: selectedDate },
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!businessId && !isLoading
  });

  const getShiftTypeBadge = (shiftType: string) => {
    const variants = {
      'morning': 'bg-yellow-100 text-yellow-800',
      'afternoon': 'bg-orange-100 text-orange-800',
      'evening': 'bg-purple-100 text-purple-800',
      'night': 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      'morning': 'בוקר',
      'afternoon': 'צהריים',
      'evening': 'ערב',
      'night': 'לילה'
    };

    return (
      <Badge className={variants[shiftType as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[shiftType as keyof typeof labels] || shiftType}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">רשימת משמרות</h1>
        <p className="text-gray-600">הצגת משמרות מתוכננות</p>
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

        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הוסף משמרת
        </Button>
      </div>

      <RealDataView
        data={shifts || []}
        loading={loading}
        error={error}
        emptyMessage="אין משמרות מתוכננות לתאריך שנבחר"
        emptyIcon={<Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        renderItem={(shift) => (
          <div key={shift.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {shift.shift_template?.name || 'משמרת'}
                </h3>
                {shift.shift_template?.shift_type && 
                  getShiftTypeBadge(shift.shift_template.shift_type)
                }
              </div>
              <Badge variant={shift.is_assigned ? "default" : "secondary"}>
                {shift.is_assigned ? 'מאויש' : 'לא מאויש'}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {shift.shift_template?.start_time} - {shift.shift_template?.end_time}
              </div>
              {shift.shift_template?.branch && (
                <span>{shift.shift_template.branch.name}</span>
              )}
            </div>

            {shift.employee ? (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {shift.employee.first_name} {shift.employee.last_name}
                  {shift.employee.employee_id && ` (${shift.employee.employee_id})`}
                </span>
                <Button size="sm" variant="outline">
                  שנה עובד
                </Button>
              </div>
            ) : (
              <Button size="sm" className="w-full">
                הקצה עובד
              </Button>
            )}

            {shift.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600">{shift.notes}</p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};
