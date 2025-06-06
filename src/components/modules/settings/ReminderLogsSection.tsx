
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Phone } from 'lucide-react';
import { useShiftReminderLogs } from '@/hooks/useShiftReminderLogs';
import { format } from 'date-fns';

export const ReminderLogsSection: React.FC = () => {
  const { data: logs, isLoading } = useShiftReminderLogs(20);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            היסטוריית תזכורות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">טוען...</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getMethodColor = (method: string) => {
    return method === 'auto' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          היסטוריית תזכורות ({logs?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!logs || logs.length === 0 ? (
          <p className="text-gray-600">לא נשלחו תזכורות עדיין</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {log.employee?.first_name} {log.employee?.last_name}
                    </span>
                    {log.phone_number && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {log.phone_number}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor(log.method)}>
                      {log.method === 'auto' ? 'אוטומטי' : 'ידני'}
                    </Badge>
                    <Badge className={getStatusColor(log.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(log.status)}
                        {log.status === 'success' ? 'נשלח' : 
                         log.status === 'failed' ? 'נכשל' : 'ממתין'}
                      </div>
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm')}
                </div>
                
                {log.error_details && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    שגיאה: {log.error_details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
