
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock, Settings } from 'lucide-react';
import { EmployeeDisplaySettingsDialog } from './EmployeeDisplaySettingsDialog';
import { useEmployeeDisplaySettings } from '@/hooks/useEmployeeDisplaySettings';

interface EmployeeStatsCardsProps {
  totalEmployees: number;
  activeEmployees: number;
  archivedEmployees: number;
  inactiveEmployees: number;
  isLoading?: boolean;
  businessId?: string | null;
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
  totalEmployees,
  activeEmployees,
  archivedEmployees,
  inactiveEmployees,
  isLoading = false,
  businessId,
}) => {
  const { settings } = useEmployeeDisplaySettings(businessId);

  console.log('📊 EmployeeStatsCards - Rendering with data:', {
    totalEmployees,
    activeEmployees,
    archivedEmployees,
    inactiveEmployees,
    isLoading,
    displayMode: settings.displayMode
  });

  // Determine which stats to display based on settings
  const actualStats = {
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    archivedEmployees,
  };

  const displayStats = settings.displayMode === 'custom' 
    ? settings.customCounts 
    : actualStats;

  const statsCards = [
    {
      title: 'עובדים קיימים',
      value: isLoading ? '...' : displayStats.totalEmployees?.toString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'עובדים לא פעילים',
      value: isLoading ? '...' : displayStats.inactiveEmployees?.toString() || '0',
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'עובדים פעילים',
      value: isLoading ? '...' : displayStats.activeEmployees?.toString() || '0',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'סה"כ עובדים',
      value: isLoading ? '...' : (displayStats.totalEmployees + displayStats.archivedEmployees)?.toString() || '0',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Settings Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">סטטיסטיקות עובדים</h3>
          {settings.displayMode === 'custom' && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
              תצוגה מותאמת
            </span>
          )}
        </div>
        <EmployeeDisplaySettingsDialog 
          businessId={businessId}
          actualStats={actualStats}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
};
