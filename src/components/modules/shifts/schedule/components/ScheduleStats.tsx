
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import type { ShiftScheduleData } from '../types';

interface ScheduleStatsProps {
  shifts: ShiftScheduleData[];
  isMobile: boolean;
}

export const ScheduleStats: React.FC<ScheduleStatsProps> = ({ shifts, isMobile }) => {
  const totalShifts = shifts.length;
  const approvedShifts = shifts.filter(s => s.status === 'approved').length;
  const pendingShifts = shifts.filter(s => s.status === 'pending').length;
  const assignedShifts = shifts.filter(s => s.employee_id && s.employee_id !== '').length;

  const stats = [
    {
      title: 'סה"כ משמרות',
      value: totalShifts,
      icon: Clock,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'מאושרות',
      value: approvedShifts,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'ממתינות',
      value: pendingShifts,
      icon: AlertCircle,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      title: 'מוקצות',
      value: assignedShifts,
      icon: Users,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className="p-3">
            <CardContent className="p-0">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
