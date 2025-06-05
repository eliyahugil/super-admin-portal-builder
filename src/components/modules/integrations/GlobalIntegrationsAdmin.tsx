
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GlobalIntegration {
  id: string;
  integration_name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const GlobalIntegrationsAdmin: React.FC = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<GlobalIntegration | null>(null);
  const { toast } = useToast();

  const { data: integrations, isLoading, refetch } = useQuery({
    queryKey: ['global-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching global integrations:', error);
        return [];
      }
      return data as GlobalIntegration[];
    },
  });

  const handleEdit = (integration: GlobalIntegration) => {
    setSelectedIntegration(integration);
    setEditDialogOpen(true);
  };

  const toggleIntegration = async (integrationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('global_integrations')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `האינטגרציה הגלובלית ${!currentStatus ? 'הופעלה' : 'הושבתה'} בהצלחה`,
      });

      refetch();
    } catch (error) {
      console.error('Error toggling global integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את האינטגרציה הגלובלית',
        variant: 'destructive',
      });
    }
  };

  const deleteIntegration = async (integrationId: string, integrationName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את האינטגרציה הגלובלית "${integrationName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('global_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'האינטגרציה הגלובלית נמחקה בהצלחה',
      });

      refetch();
    } catch (error) {
      console.error('Error deleting global integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את האינטגרציה הגלובלית',
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">אינטגרציות גלובליות</h3>
          <p className="text-sm text-gray-500">
            ניהול אינטגרציות גלובליות לכל המערכת
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              הוסף אינטגרציה גלובלית
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוסף אינטגרציה גלובלית חדשה</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>שם האינטגרציה</Label>
                <Input placeholder="google_maps" />
              </div>
              <div>
                <Label>שם תצוגה</Label>
                <Input placeholder="Google Maps" />
              </div>
              <div>
                <Label>תיאור</Label>
                <Textarea placeholder="תיאור האינטגרציה..." />
              </div>
              <div>
                <Label>API Key</Label>
                <Input type="password" placeholder="מפתח API..." />
              </div>
              <div className="flex items-center space-x-2">
                <Switch />
                <Label>פעיל</Label>
              </div>
              <Button className="w-full">
                הוסף אינטגרציה
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!integrations?.length ? (
        <div className="text-center py-8">
          <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">אין אינטגרציות גלובליות מוגדרות עדיין</p>
          <p className="text-sm text-gray-400">התחל על ידי הוספת האינטגרציה הראשונה</p>
        </div>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">{integration.display_name}</h4>
                      <p className="text-sm text-gray-500">
                        {integration.integration_name} • 
                        נוצר: {new Date(integration.created_at).toLocaleDateString('he-IL')}
                      </p>
                      {integration.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {integration.description}
                        </p>
                      )}
                    </div>
                    
                    <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                      {integration.is_active ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleIntegration(integration.id, integration.is_active)}
                    >
                      {integration.is_active ? 'השבת' : 'הפעל'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(integration)}
                    >
                      <Edit className="h-4 w-4" />
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
      )}
    </div>
  );
};
