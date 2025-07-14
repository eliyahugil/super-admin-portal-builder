
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Shield } from 'lucide-react';

interface Stats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalUsers: number;
}

interface SuperAdminStatsProps {
  stats: Stats;
}

export const SuperAdminStats: React.FC<SuperAdminStatsProps> = ({ stats }) => {
  const statsData = [
    {
      title: 'סך הכל עסקים',
      value: stats.totalBusinesses,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900'
    },
    {
      title: 'עסקים פעילים',
      value: stats.activeBusinesses,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900'
    },
    {
      title: 'סך הכל משתמשים',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8" dir="rtl">
      {statsData.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"></div>
          <CardContent className="relative p-4 sm:p-6">
            <div className="text-center sm:text-right">
              <div className={`inline-flex p-3 rounded-2xl ${stat.bgColor} mb-3`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className={`text-xl sm:text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
