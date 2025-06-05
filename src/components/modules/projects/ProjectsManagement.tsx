
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, CheckSquare, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectsManagement: React.FC = () => {
  const stats = [
    { label: 'פרויקטים פעילים', value: '8', icon: Target, color: 'text-blue-600' },
    { label: 'משימות פתוחות', value: '24', icon: CheckSquare, color: 'text-orange-600' },
    { label: 'תוך לוח זמנים', value: '6', icon: Calendar, color: 'text-green-600' },
    { label: 'חברי צוות', value: '12', icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול פרויקטים</h1>
        <p className="text-gray-600 mt-2">עקוב ונהל פרויקטים ומשימות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>משימות</CardTitle>
              <CardDescription>נהל משימות פרויקטים</CardDescription>
            </div>
            <Link to="/modules/projects/tasks">
              <Button variant="outline">צפה במשימות</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">בקרוב - ניהול פרויקטים מתקדם</p>
        </CardContent>
      </Card>
    </div>
  );
};
