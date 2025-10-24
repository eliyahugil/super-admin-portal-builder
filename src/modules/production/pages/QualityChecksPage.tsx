import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ClipboardCheck, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { QualityCheck } from '@/types/production';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const QualityChecksPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: checks, isLoading } = useQuery({
    queryKey: ['quality-checks', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_checks')
        .select('*')
        .eq('business_id', businessId!)
        .order('check_date', { ascending: false });
      
      if (error) throw error;
      return data as QualityCheck[];
    },
    enabled: !!businessId
  });

  const filteredChecks = checks?.filter(check => 
    selectedType === 'all' || check.check_type === selectedType
  );

  const getCheckTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'raw_material': 'חומר גלם',
      'in_process': 'תהליך ייצור',
      'finished_product': 'מוצר מוגמר'
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">בקרת איכות</h1>
            <p className="text-muted-foreground">בדיקות איכות ורישום ממצאים</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/production')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור
          </Button>
          <Button onClick={() => navigate('/production/quality/new')}>
            <Plus className="h-4 w-4 ml-2" />
            בדיקה חדשה
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedType('all')}
        >
          הכל
        </Button>
        <Button
          variant={selectedType === 'raw_material' ? 'default' : 'outline'}
          onClick={() => setSelectedType('raw_material')}
        >
          חומרי גלם
        </Button>
        <Button
          variant={selectedType === 'in_process' ? 'default' : 'outline'}
          onClick={() => setSelectedType('in_process')}
        >
          תהליך
        </Button>
        <Button
          variant={selectedType === 'finished_product' ? 'default' : 'outline'}
          onClick={() => setSelectedType('finished_product')}
        >
          מוצר מוגמר
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : !filteredChecks?.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">אין בדיקות איכות להצגה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredChecks.map((check) => (
            <Card 
              key={check.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/production/quality/${check.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {check.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <CardTitle className="text-lg">
                        {check.product_name || 'בדיקת איכות'}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(check.check_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {getCheckTypeLabel(check.check_type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {check.temperature !== null && check.temperature !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">טמפרטורה</span>
                      <span>{check.temperature}°C</span>
                    </div>
                  )}
                  {check.ph_level !== null && check.ph_level !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">רמת pH</span>
                      <span>{check.ph_level}</span>
                    </div>
                  )}
                  {!check.passed && check.failure_reason && (
                    <div className="pt-2 border-t">
                      <p className="text-red-600 font-medium">סיבת כשל:</p>
                      <p className="text-sm">{check.failure_reason}</p>
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
