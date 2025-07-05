
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, UserPlus, Calendar } from 'lucide-react';
import type { ShiftScheduleData } from '../types';

interface ScheduleStatsProps {
  shifts: ShiftScheduleData[];
  isMobile: boolean;
}

export const ScheduleStats: React.FC<ScheduleStatsProps> = ({ shifts, isMobile }) => {
  const getScheduleStats = () => {
    const today = new Date();
    const todayShifts = shifts.filter(shift => 
      new Date(shift.shift_date).toDateString() === today.toDateString()
    );
    
    const assignedShifts = shifts.filter(shift => shift.employee_id && shift.employee_id !== '');
    const unassignedShifts = shifts.filter(shift => !shift.employee_id || shift.employee_id === '');
    const totalEmployees = new Set(shifts.map(shift => shift.employee_id).filter(Boolean)).size;

    return {
      todayShifts: todayShifts.length,
      totalEmployees,
      assignedShifts: assignedShifts.length,
      unassignedShifts: unassignedShifts.length
    };
  };

  const stats = getScheduleStats();

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4`}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">משמרות היום</p>
              <p className="text-2xl font-bold">{stats.todayShifts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">עובדים פעילים</p>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">משמרות מוקצות</p>
              <p className="text-2xl font-bold">{stats.assignedShifts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">משמרות פנויות</p>
              <p className="text-2xl font-bold">{stats.unassignedShifts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
