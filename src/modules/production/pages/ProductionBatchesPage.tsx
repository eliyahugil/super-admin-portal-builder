import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { ProductionBatch } from '@/types/production';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const ProductionBatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: batches, isLoading } = useQuery({
    queryKey: ['production-batches', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_batches')
        .select('*')
        .eq('business_id', businessId!)
        .order('production_date', { ascending: false });
      
      if (error) throw error;
      return data as ProductionBatch[];
    },
    enabled: !!businessId
  });

  const filteredBatches = batches?.filter(batch => 
    selectedStatus === 'all' || batch.status === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'planned': { label: 'מתוכנן', variant: 'default' },
      'in_progress': { label: 'בתהליך', variant: 'secondary' },
      'completed': { label: 'הושלם', variant: 'default' },
      'cancelled': { label: 'בוטל', variant: 'destructive' }
    };
    const config = variants[status] || variants.planned;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">אצוות ייצור</h1>
            <p className="text-muted-foreground">ניהול אצוות ייצור יומיות</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/production')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור
          </Button>
          <Button onClick={() => navigate('/production/batches/new')}>
            <Plus className="h-4 w-4 ml-2" />
            אצווה חדשה
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('all')}
        >
          הכל
        </Button>
        <Button
          variant={selectedStatus === 'planned' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('planned')}
        >
          מתוכנן
        </Button>
        <Button
          variant={selectedStatus === 'in_progress' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('in_progress')}
        >
          בתהליך
        </Button>
        <Button
          variant={selectedStatus === 'completed' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('completed')}
        >
          הושלם
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : !filteredBatches?.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">אין אצוות ייצור להצגה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBatches.map((batch) => (
            <Card 
              key={batch.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/production/batches/${batch.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{batch.product_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">אצווה: {batch.batch_number}</p>
                  </div>
                  {getStatusBadge(batch.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      תאריך ייצור
                    </p>
                    <p className="font-medium">
                      {format(new Date(batch.production_date), 'dd/MM/yyyy', { locale: he })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      כמות מתוכננת
                    </p>
                    <p className="font-medium">{batch.planned_quantity} {batch.unit}</p>
                  </div>
                  {batch.actual_quantity && (
                    <div>
                      <p className="text-muted-foreground">כמות בפועל</p>
                      <p className="font-medium">{batch.actual_quantity} {batch.unit}</p>
                    </div>
                  )}
                  {batch.shift_type && (
                    <div>
                      <p className="text-muted-foreground">משמרת</p>
                      <p className="font-medium">{batch.shift_type}</p>
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
