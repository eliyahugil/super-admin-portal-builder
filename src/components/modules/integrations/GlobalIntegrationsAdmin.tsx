
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
import { Plus, Edit, Trash2, Key, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GlobalIntegrationForm } from './GlobalIntegrationForm';

interface GlobalIntegration {
  id: string;
  integration_name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const GlobalIntegrationsAdmin: React.FC = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<GlobalIntegration | null>(null);
  const [expandedIntegrations, setExpandedIntegrations] = useState<Set<string>>(new Set());
  const [newIntegration, setNewIntegration] = useState({
    integration_name: '',
    display_name: '',
    description: '',
    is_active: true
  });
  const { toast } = useToast();

  console.log('=== GlobalIntegrationsAdmin RENDER ===');

  const { data: integrations, isLoading, refetch } = useQuery({
    queryKey: ['global-integrations'],
    queryFn: async () => {
      console.log('=== FETCHING GLOBAL INTEGRATIONS ===');
      const { data, error } = await supabase
        .from('global_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching global integrations:', error);
        return [];
      }
      console.log('Fetched integrations:', data);
      return data as GlobalIntegration[];
    },
  });

  const handleCreateIntegration = async () => {
    console.log('=== CREATE INTEGRATION CLICKED ===');
    console.log('New integration data:', newIntegration);
    
    try {
      const { error } = await supabase
        .from('global_integrations')
        .insert({
          integration_name: newIntegration.integration_name,
          display_name: newIntegration.display_name,
          description: newIntegration.description,
          is_active: newIntegration.is_active,
          config: {}
        });

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'האינטגרציה הגלובלית נוצרה בהצלחה',
      });

      setCreateDialogOpen(false);
      setNewIntegration({
        integration_name: '',
        display_name: '',
        description: '',
        is_active: true
      });
      refetch();
    } catch (error) {
      console.error('Error creating global integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את האינטגרציה הגלובלית',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (integration: GlobalIntegration) => {
    console.log('=== EDIT INTEGRATION CLICKED ===');
    console.log('Integration to edit:', integration);
    setSelectedIntegration(integration);
    setEditDialogOpen(true);
  };

  const toggleIntegration = async (integrationId: string, currentStatus: boolean) => {
    console.log('=== TOGGLE INTEGRATION CLICKED ===');
    console.log('Integration ID:', integrationId, 'Current status:', currentStatus);
    
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
    console.log('=== DELETE INTEGRATION CLICKED ===');
    console.log('Integration ID:', integrationId, 'Name:', integrationName);
    
    if (!confirm(`האם אתה בטוח שברצונך למחוק את האינטגרציה הגלובלית "${integrationName}"?`)) {
      console.log('Delete cancelled by user');
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

  const toggleExpanded = (integrationId: string) => {
    console.log('=== TOGGLE EXPANDED CLICKED ===');
    console.log('Integration ID:', integrationId);
    
    setExpandedIntegrations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(integrationId)) {
        newSet.delete(integrationId);
        console.log('Collapsed integration:', integrationId);
      } else {
        newSet.add(integrationId);
        console.log('Expanded integration:', integrationId);
      }
      return newSet;
    });
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

  console.log('Current integrations:', integrations);
  console.log('Expanded integrations:', expandedIntegrations);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">אינטגרציות גלובליות</h3>
          <p className="text-sm text-gray-500">
            ניהול אינטגרציות גלובליות לכל המערכת
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              console.log('=== ADD INTEGRATION DIALOG OPENED ===');
              setCreateDialogOpen(true);
            }}>
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
                <Input 
                  placeholder="google_maps" 
                  value={newIntegration.integration_name}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    integration_name: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label>שם תצוגה</Label>
                <Input 
                  placeholder="Google Maps" 
                  value={newIntegration.display_name}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    display_name: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label>תיאור</Label>
                <Textarea 
                  placeholder="תיאור האינטגרציה..." 
                  value={newIntegration.description}
                  onChange={(e) => setNewIntegration(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={newIntegration.is_active}
                  onCheckedChange={(checked) => setNewIntegration(prev => ({
                    ...prev,
                    is_active: checked
                  }))}
                />
                <Label>פעיל</Label>
              </div>
              <Button 
                className="w-full"
                onClick={handleCreateIntegration}
                disabled={!newIntegration.integration_name || !newIntegration.display_name}
              >
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
                      onClick={() => toggleExpanded(integration.id)}
                    >
                      <Settings className="h-4 w-4" />
                      {expandedIntegrations.has(integration.id) ? 'סגור' : 'הגדר'}
                    </Button>
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
                
                {expandedIntegrations.has(integration.id) && (
                  <GlobalIntegrationForm
                    integration={{
                      id: integration.id,
                      integration_name: integration.integration_name,
                      display_name: integration.display_name,
                      global_config: integration.config
                    }}
                    onUpdate={refetch}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedIntegration && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>עריכת אינטגרציה גלובלית</DialogTitle>
            </DialogHeader>
            <GlobalIntegrationForm
              integration={{
                id: selectedIntegration.id,
                integration_name: selectedIntegration.integration_name,
                display_name: selectedIntegration.display_name,
                global_config: selectedIntegration.config
              }}
              onUpdate={() => {
                refetch();
                setEditDialogOpen(false);
                setSelectedIntegration(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
