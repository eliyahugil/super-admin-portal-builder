
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

interface EmployeeStatsCardsProps {
  totalEmployees: number;
  activeEmployees: number;
  archivedEmployees: number;
  inactiveEmployees: number;
  isLoading?: boolean;
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
  totalEmployees,
  activeEmployees,
  archivedEmployees,
  inactiveEmployees,
  isLoading = false,
}) => {
  console.log('📊 EmployeeStatsCards - Rendering with data:', {
    totalEmployees,
    activeEmployees,
    archivedEmployees,
    inactiveEmployees,
    isLoading
  });

  const statsCards = [
    {
      title: 'עובדים קיימים',
      value: isLoading ? '...' : totalEmployees?.toString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'עובדים לא פעילים',
      value: isLoading ? '...' : inactiveEmployees?.toString() || '0',
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'עובדים פעילים',
      value: isLoading ? '...' : activeEmployees?.toString() || '0',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'סה"כ עובדים',
      value: isLoading ? '...' : (totalEmployees + archivedEmployees)?.toString() || '0',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
