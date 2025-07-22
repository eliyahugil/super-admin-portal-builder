import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useEmployeeRegistrationTokens } from '@/hooks/useEmployeeRegistrationTokens';
import { useEmployeeRegistrationRequests } from '@/hooks/useEmployeeRegistrationRequests';

export const RegistrationTokenStats: React.FC = () => {
  const { tokens } = useEmployeeRegistrationTokens();
  const { requests, pendingRequests, approvedRequests } = useEmployeeRegistrationRequests();

  const activeTokens = tokens.filter(token => token.is_active);
  const expiredTokens = tokens.filter(token => 
    token.expires_at && new Date(token.expires_at) < new Date()
  );
  
  const totalRegistrations = tokens.reduce((sum, token) => sum + token.current_registrations, 0);

  const stats = [
    {
      title: 'טוקנים פעילים',
      value: activeTokens.length,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'טוקנים שפג תוקפם',
      value: expiredTokens.length,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'בקשות ממתינות',
      value: pendingRequests.length,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'סה"כ רישומים',
      value: totalRegistrations,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};