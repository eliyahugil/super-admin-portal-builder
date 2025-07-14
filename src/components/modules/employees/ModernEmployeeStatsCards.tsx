import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Archive,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface ModernEmployeeStatsCardsProps {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  archivedEmployees: number;
  isLoading?: boolean;
  businessId: string;
}

export const ModernEmployeeStatsCards: React.FC<ModernEmployeeStatsCardsProps> = ({
  totalEmployees,
  activeEmployees,
  inactiveEmployees,
  archivedEmployees,
  isLoading = false,
}) => {
  const activePercentage = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;
  const isGrowthPositive = activePercentage >= 70; // Consider 70% active as positive

  const stats = [
    {
      title: 'סה"כ עובדים',
      value: totalEmployees,
      icon: Users,
      description: 'כל העובדים במערכת',
      color: 'primary',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      title: 'עובדים פעילים',
      value: activeEmployees,
      icon: UserCheck,
      description: `${activePercentage}% מכלל העובדים`,
      color: 'success',
      bgColor: 'bg-success/10',
      iconColor: 'text-success',
      trend: isGrowthPositive ? 'up' : 'down',
      trendValue: `${activePercentage}%`,
    },
    {
      title: 'לא פעילים',
      value: inactiveEmployees,
      icon: UserX,
      description: inactiveEmployees > 0 ? 'דורש טיפול' : 'מצב מצוין',
      color: inactiveEmployees > 0 ? 'warning' : 'success',
      bgColor: inactiveEmployees > 0 ? 'bg-warning/10' : 'bg-success/10',
      iconColor: inactiveEmployees > 0 ? 'text-warning' : 'text-success',
      trend: null,
    },
    {
      title: 'בארכיון',
      value: archivedEmployees,
      icon: Archive,
      description: 'עובדים לשעבר',
      color: 'muted',
      bgColor: 'bg-muted/50',
      iconColor: 'text-muted-foreground',
      trend: null,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-modern">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className="card-gradient hover-glow animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    {stat.trend && (
                      <Badge variant="secondary" className="text-xs">
                        {stat.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1 text-success" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1 text-warning" />
                        )}
                        {stat.trendValue}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value.toLocaleString('he-IL')}
                    </p>
                    {stat.title === 'עובדים פעילים' && totalEmployees > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Activity className="h-3 w-3 mr-1" />
                        פעילות גבוהה
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stat.description}
                  </p>
                  
                  {/* Progress bar for active employees */}
                  {stat.title === 'עובדים פעילים' && totalEmployees > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${activePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};