
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Puzzle, Activity } from 'lucide-react';

interface SystemStats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalUsers: number;
  activeModules: number;
  pendingApprovals: number;
  systemHealth: number;
}

interface SuperAdminStatsProps {
  systemStats: SystemStats;
}

export const SuperAdminStats: React.FC<SuperAdminStatsProps> = ({ systemStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">עסקים פעילים</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemStats.activeBusinesses}</div>
          <p className="text-xs text-muted-foreground">
            מתוך {systemStats.totalBusinesses} עסקים
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">משתמשים במערכת</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            משתמשים רשומים
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">מודולים פעילים</CardTitle>
          <Puzzle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemStats.activeModules}</div>
          <p className="text-xs text-muted-foreground">
            מודולים זמינים
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">תקינות מערכת</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemStats.systemHealth}%</div>
          <p className="text-xs text-muted-foreground">
            זמינות מערכת
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
