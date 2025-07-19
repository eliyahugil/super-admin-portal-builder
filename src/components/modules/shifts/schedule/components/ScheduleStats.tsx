
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, CheckCircle, AlertCircle, FileText, UserCheck } from 'lucide-react';
import type { ShiftScheduleData } from '../types';

interface ScheduleStatsProps {
  shifts: ShiftScheduleData[];
  isMobile: boolean;
  pendingSubmissions?: any[];
}

export const ScheduleStats: React.FC<ScheduleStatsProps> = ({ shifts, isMobile, pendingSubmissions = [] }) => {
  console.log('📊 ScheduleStats rendering with:', {
    shiftsCount: shifts.length,
    isMobile,
    pendingSubmissionsCount: pendingSubmissions.length,
    pendingSubmissions: pendingSubmissions
  });

  const totalShifts = shifts.length;
  const approvedShifts = shifts.filter(s => s.status === 'approved').length;
  const pendingShifts = shifts.filter(s => s.status === 'pending').length;
  const assignedShifts = shifts.filter(s => s.employee_id && s.employee_id !== '').length;
  
  // Calculate submission statistics from actual submissions data
  const totalSubmissions = pendingSubmissions.length;
  
  // Calculate total shift requests from submissions properly
  const totalShiftRequests = pendingSubmissions.reduce((total, submission) => {
    // Each submission has a shifts array with requested shifts
    const shiftsInSubmission = submission.shifts || [];
    return total + shiftsInSubmission.length;
  }, 0);

  console.log('📊 ScheduleStats calculated:', {
    totalShifts,
    approvedShifts,
    pendingShifts,
    assignedShifts,
    totalSubmissions,
    totalShiftRequests,
    submissionDetails: pendingSubmissions.map(s => ({
      id: s.id,
      shiftsCount: (s.shifts || []).length,
      shifts: s.shifts
    }))
  });

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
    },
    {
      title: 'הגשות ממתינות',
      value: totalSubmissions,
      icon: FileText,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      title: 'בקשות למשמרות',
      value: totalShiftRequests,
      icon: UserCheck,
      color: 'text-cyan-600 bg-cyan-50'
    }
  ];

  if (isMobile) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-right">סטטיסטיקות</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="p-3 border border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-right">סטטיסטיקות משמרות</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
