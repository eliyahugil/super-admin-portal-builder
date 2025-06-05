
import React from 'react';
import { Users, Calendar, DollarSign, Bell } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

interface DashboardStatsProps {
  activeEmployeesCount: number;
  shiftsCount: number;
  attendanceCount: number;
  pendingRequestsCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  activeEmployeesCount,
  shiftsCount,
  attendanceCount,
  pendingRequestsCount
}) => {
  const quickStats = [
    {
      title: 'עובדים פעילים',
      value: activeEmployeesCount,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'משמרות היום',
      value: shiftsCount,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'כניסות היום',
      value: attendanceCount,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'בקשות ממתינות',
      value: pendingRequestsCount,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {quickStats.map((stat, index) => (
        <DashboardCard key={index} {...stat} />
      ))}
    </div>
  );
};
