
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Settings } from 'lucide-react';
import { useIntegrationAuditLog } from '@/hooks/useIntegrationAuditLog';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface IntegrationAuditLogProps {
  businessId: string;
  integrationName?: string;
}

export const IntegrationAuditLog: React.FC<IntegrationAuditLogProps> = ({
  businessId,
  integrationName,
}) => {
  const { auditLogs, isLoading } = useIntegrationAuditLog(businessId);

  const filteredLogs = integrationName
    ? auditLogs.filter(log => log.integration_name === integrationName)
    : auditLogs;

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create':
      case 'enable':
        return 'default';
      case 'edit':
      case 'test':
        return 'secondary';
      case 'disable':
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'יצירה',
      edit: 'עריכה',
      enable: 'הפעלה',
      disable: 'השבתה',
      test: 'בדיקה',
      delete: 'מחיקה',
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">טוען יומן פעילות...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          יומן ביקורת
        </CardTitle>
        <CardDescription>
          {integrationName 
            ? `פעילות עבור ${integrationName}`
            : 'כל הפעילות באינטגרציות'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                אין פעילות רשומה
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50"
                >
                  <Settings className="h-4 w-4 mt-1 text-gray-500" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                      <span className="font-medium">{log.integration_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                          locale: he,
                        })}
                      </span>
                      {log.user_id && (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          <span>משתמש: {log.user_id.slice(0, 8)}...</span>
                        </>
                      )}
                    </div>

                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          פרטי השינויים
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
