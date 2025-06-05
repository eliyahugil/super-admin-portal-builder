
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';

interface BusinessIntegration {
  id: string;
  integration_name: string;
  display_name: string;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
}

export const BusinessIntegrationsList: React.FC = () => {
  const { businessId } = useBusiness();
  const { toast } = useToast();

  const { data: integrations, isLoading, refetch } = useQuery({
    queryKey: ['business-integrations', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('No business ID');

      const { data, error } = await supabase
        .from('business_integrations')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching business integrations:', error);
        throw error;
      }
      return data as BusinessIntegration[];
    },
    enabled: !!businessId,
  });

  const toggleIntegration = async (integrationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('business_integrations')
        .update({ is_active: !currentStatus })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `האינטגרציה ${!currentStatus ? 'הופעלה' : 'הושבתה'} בהצלחה`,
      });

      refetch();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את האינטגרציה',
        variant: 'destructive',
      });
    }
  };

  const deleteIntegration = async (integrationId: string, integrationName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את האינטגרציה "${integrationName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('business_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'האינטגרציה נמחקה בהצלחה',
      });

      refetch();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את האינטגרציה',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!integrations?.length) {
    return (
      <div className="text-center py-8">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">אין אינטגרציות מוגדרות עדיין</p>
        <p className="text-sm text-gray-400">התחל על ידי הוספת האינטגרציה הראשונה</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {integration.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-medium">{integration.display_name}</h3>
                    <p className="text-sm text-gray-500">
                      נוצר: {new Date(integration.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                    {integration.is_active ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                  {integration.last_sync && (
                    <Badge variant="outline">
                      סונכרן: {new Date(integration.last_sync).toLocaleDateString('he-IL')}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleIntegration(integration.id, integration.is_active)}
                >
                  {integration.is_active ? 'השבת' : 'הפעל'}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => deleteIntegration(integration.id, integration.display_name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
