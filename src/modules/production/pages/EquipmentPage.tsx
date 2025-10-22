import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Wrench, AlertCircle } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { ProductionEquipment } from '@/types/production';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const EquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['production-equipment', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_equipment')
        .select('*')
        .eq('business_id', businessId!)
        .eq('is_active', true)
        .order('equipment_name');
      
      if (error) throw error;
      return data as ProductionEquipment[];
    },
    enabled: !!businessId
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'operational': { label: 'תקין', variant: 'default', className: 'bg-green-500' },
      'maintenance': { label: 'בתחזוקה', variant: 'secondary' },
      'broken': { label: 'תקול', variant: 'destructive' }
    };
    const config = variants[status] || variants.operational;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">ציוד ייצור</h1>
            <p className="text-muted-foreground">ניהול ציוד ותחזוקה שוטפת</p>
          </div>
        </div>
        <Button onClick={() => navigate('/production/equipment/new')}>
          <Plus className="h-4 w-4 ml-2" />
          ציוד חדש
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : !equipment?.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">אין ציוד להצגה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => {
            const needsMaintenance = item.next_maintenance_due && 
              new Date(item.next_maintenance_due) < new Date();

            return (
              <Card 
                key={item.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${needsMaintenance ? 'border-orange-200' : ''}`}
                onClick={() => navigate(`/production/equipment/${item.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{item.equipment_name}</CardTitle>
                      {item.equipment_code && (
                        <p className="text-sm text-muted-foreground">קוד: {item.equipment_code}</p>
                      )}
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.equipment_type && (
                    <Badge variant="outline">{item.equipment_type}</Badge>
                  )}
                  {item.location && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">מיקום: </span>
                      <span>{item.location}</span>
                    </div>
                  )}
                  {needsMaintenance && (
                    <div className="flex items-center gap-2 text-orange-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>נדרשת תחזוקה</span>
                    </div>
                  )}
                  {item.next_maintenance_due && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">תחזוקה הבאה: </span>
                      <span>{format(new Date(item.next_maintenance_due), 'dd/MM/yyyy', { locale: he })}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
