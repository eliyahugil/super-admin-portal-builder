
import React from 'react';

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
  <div className="bg-white rounded-2xl shadow-md p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="mr-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  </div>
);
