
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Building2, Puzzle, Globe, Activity } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  link: string;
  color: string;
  stats: string;
}

interface SuperAdminQuickActionsProps {
  systemStats: {
    totalBusinesses: number;
    activeModules: number;
  };
}

export const SuperAdminQuickActions: React.FC<SuperAdminQuickActionsProps> = ({ systemStats }) => {
  const quickActions: QuickAction[] = [
    {
      title: 'ניהול עסקים',
      description: 'הוסף, ערוך ונהל עסקים במערכת',
      icon: Building2,
      link: '/admin/businesses',
      color: 'bg-blue-500',
      stats: `${systemStats.totalBusinesses} עסקים`
    },
    {
      title: 'ניהול מודולים',
      description: 'נהל מודולים והרשאות עבור עסקים',
      icon: Puzzle,
      link: '/admin/modules',
      color: 'bg-green-500',
      stats: `${systemStats.activeModules} מודולים פעילים`
    },
    {
      title: 'אינטגרציות כלליות',
      description: 'הגדר אינטגרציות זמינות לכל העסקים',
      icon: Globe,
      link: '/admin/integrations',
      color: 'bg-purple-500',
      stats: '8 אינטגרציות זמינות'
    },
    {
      title: 'תצוגת מערכת',
      description: 'בדוק ותצוג מודולים לפני פרסום',
      icon: Activity,
      link: '/admin/system-preview',
      color: 'bg-orange-500',
      stats: 'בדיקת איכות'
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>פעולות מהירות</CardTitle>
        <CardDescription>גישה מהירה לפונקציות הניהול הראשיות</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {action.stats}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
