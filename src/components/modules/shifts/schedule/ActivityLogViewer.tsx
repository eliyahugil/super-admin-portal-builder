import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface ActivityLogViewerProps {
  businessId: string | null;
  maxEntries?: number;
}

export const ActivityLogViewer: React.FC<ActivityLogViewerProps> = ({
  businessId,
  maxEntries = 50
}) => {
  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['activity-logs', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .or(`target_type.eq.shift,action.ilike.%shift%`)
        .order('created_at', { ascending: false })
        .limit(maxEntries);

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!businessId
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'shift_created':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shift_deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'duplicate_shift_prevented':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'shift_created':
        return 'משמרת נוצרה';
      case 'shift_deleted':
        return 'משמרת נמחקה';
      case 'duplicate_shift_prevented':
        return 'כפילות נמנעה';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'shift_created':
        return 'bg-green-100 text-green-800';
      case 'shift_deleted':
        return 'bg-red-100 text-red-800';
      case 'duplicate_shift_prevented':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            פעילות משמרות אחרונה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">טוען...</div>
        </CardContent>
      </Card>
    );
  }

  if (!activityLogs || activityLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            פעילות משמרות אחרונה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">אין פעילות להצגה</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          פעילות משמרות אחרונה
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-card"
              >
                <div className="mt-1">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </span>
                  </div>
                  
                  {log.details && typeof log.details === 'object' && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      {(log.details as any).shift_date && (
                        <div>תאריך משמרת: {(log.details as any).shift_date}</div>
                      )}
                      {(log.details as any).start_time && (log.details as any).end_time && (
                        <div>שעות: {(log.details as any).start_time} - {(log.details as any).end_time}</div>
                      )}
                      {(log.details as any).employee_id && (
                        <div>מזהה עובד: {(log.details as any).employee_id}</div>
                      )}
                      {(log.details as any).branch_id && (
                        <div>מזהה סניף: {(log.details as any).branch_id}</div>
                      )}
                      {(log.details as any).creation_method && (
                        <div>דרך יצירה: {(log.details as any).creation_method}</div>
                      )}
                      {log.action === 'duplicate_shift_prevented' && (
                        <div className="text-orange-600 font-medium">
                          ⚠️ ניסיון ליצור משמרת כפולה נמנע
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};