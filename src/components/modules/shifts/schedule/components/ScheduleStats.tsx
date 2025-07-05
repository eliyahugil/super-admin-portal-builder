
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import type { ShiftScheduleData } from '../types';

interface ScheduleStatsProps {
  shifts: ShiftScheduleData[];
  isMobile: boolean;
}

export const ScheduleStats: React.FC<ScheduleStatsProps> = ({
  shifts,
  isMobile
}) => {
  const totalShifts = shifts.length;
  const approvedShifts = shifts.filter(s => s.status === 'approved').length;
  const pendingShifts = shifts.filter(s => s.status === 'pending').length;
  const assignedShifts = shifts.filter(s => s.employee_id).length;

  const stats = [
    {
      icon: Calendar,
      label: 'סה"כ משמרות',
      value: totalShifts,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: CheckCircle,
      label: 'מאושרות',
      value: approvedShifts,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Clock,
      label: 'ממתינות',
      value: pendingShifts,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: User,
      label: 'מוקצות',
      value: assignedShifts,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
