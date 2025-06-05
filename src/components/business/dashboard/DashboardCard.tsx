
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor 
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="mr-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
