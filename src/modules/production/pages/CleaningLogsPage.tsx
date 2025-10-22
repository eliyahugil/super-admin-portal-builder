import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { CleaningLog } from '@/types/production';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const CleaningLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['cleaning-logs', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleaning_logs')
        .select('*')
        .eq('business_id', businessId!)
        .order('cleaning_date', { ascending: false });
      
      if (error) throw error;
      return data as CleaningLog[];
    },
    enabled: !!businessId
  });

  const filteredLogs = logs?.filter(log => 
    selectedType === 'all' || log.cleaning_type === selectedType
  );

  const getCleaningTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'regular': 'רגיל',
      'deep': 'עמוק',
      'sanitization': 'חיטוי'
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">ניקיון והיגיינה</h1>
            <p className="text-muted-foreground">רישום פעולות ניקיון ואימות</p>
          </div>
        </div>
        <Button onClick={() => navigate('/production/cleaning/new')}>
          <Plus className="h-4 w-4 ml-2" />
          רישום ניקיון חדש
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedType('all')}
        >
          הכל
        </Button>
        <Button
          variant={selectedType === 'regular' ? 'default' : 'outline'}
          onClick={() => setSelectedType('regular')}
        >
          רגיל
        </Button>
        <Button
          variant={selectedType === 'deep' ? 'default' : 'outline'}
          onClick={() => setSelectedType('deep')}
        >
          עמוק
        </Button>
        <Button
          variant={selectedType === 'sanitization' ? 'default' : 'outline'}
          onClick={() => setSelectedType('sanitization')}
        >
          חיטוי
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : !filteredLogs?.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">אין רישומי ניקיון להצגה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredLogs.map((log) => (
            <Card 
              key={log.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/production/cleaning/${log.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {log.area_name}
                      {log.equipment_name && ` - ${log.equipment_name}`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.cleaning_date), 'dd/MM/yyyy', { locale: he })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">
                      {getCleaningTypeLabel(log.cleaning_type)}
                    </Badge>
                    {log.verification_performed && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        מאומת
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {log.cleaning_products_used && (
                    <div>
                      <span className="text-muted-foreground">חומרי ניקוי: </span>
                      <span>{log.cleaning_products_used}</span>
                    </div>
                  )}
                  {log.passed !== null && log.passed !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">תוצאה:</span>
                      <Badge variant={log.passed ? 'default' : 'destructive'}>
                        {log.passed ? 'עבר בהצלחה' : 'לא עבר'}
                      </Badge>
                    </div>
                  )}
                  {log.next_cleaning_due && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">ניקיון הבא:</span>
                      <span>{format(new Date(log.next_cleaning_due), 'dd/MM/yyyy', { locale: he })}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
