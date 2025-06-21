
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users, HardDrive } from 'lucide-react';
import { DataSummary, StatsItem } from './types';

interface StatsCardsProps {
  dataSummary: DataSummary;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ dataSummary }) => {
  const stats: StatsItem[] = [
    {
      title: 'אירועי Calendar',
      value: dataSummary.totalEvents,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'אירועים קרובים',
      value: dataSummary.upcomingEvents,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'אנשי קשר',
      value: dataSummary.totalContacts,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'קבצים ב-Drive',
      value: dataSummary.filesStored,
      icon: HardDrive,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
