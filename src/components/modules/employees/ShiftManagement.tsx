
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ShiftManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: shifts } = useQuery({
    queryKey: ['scheduled-shifts', selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_shifts')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id),
          shift_template:shift_templates(
            name,
            start_time,
            end_time,
            shift_type,
            branch:branches(name)
          )
        `)
        .eq('shift_date', selectedDate)
        .order('shift_template.start_time');

      if (error) throw error;
      return data || [];
    },
  });

  const { data: shiftTemplates } = useQuery({
    queryKey: ['shift-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_templates')
        .select(`
          *,
          branch:branches(name)
        `)
        .eq('is_active', true)
        .order('start_time');

      if (error) throw error;
      return data || [];
    },
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

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול משמרות</h1>
        <p className="text-gray-600">תכנון וניהול משמרות עובדים</p>
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

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Shifts */}
        <div>
          <h2 className="text-xl font-semibold mb-4">משמרות מתוכננות</h2>
          <div className="space-y-4">
            {shifts?.map((shift) => (
              <Card key={shift.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {shift.shift_template?.name}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Shift Templates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">תבניות משמרות</h2>
          <div className="space-y-4">
            {shiftTemplates?.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    {getShiftTypeBadge(template.shift_type)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {template.start_time} - {template.end_time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {template.required_employees} עובדים
                    </div>
                  </div>

                  {template.branch && (
                    <p className="text-sm text-gray-600 mb-3">
                      סניף: {template.branch.name}
                    </p>
                  )}

                  <Button size="sm" variant="outline" className="w-full">
                    צור משמרת מתבנית זו
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {shifts?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין משמרות</h3>
          <p className="text-gray-600">לא נמצאו משמרות לתאריך שנבחר</p>
        </div>
      )}
    </div>
  );
};
