
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Shield,
  Layers,
  Plug 
} from 'lucide-react';
import { useModuleConfig } from '@/hooks/useModuleConfig';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { ModuleConfig, ModuleCategory } from './ModuleConfigTypes';

export const SuperAdminModuleConfig: React.FC = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);
  const { moduleConfigs, isLoading, refetchModules } = useModuleConfig();
  const { toast } = useToast();

  const handleToggleModule = async (moduleId: string, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('modules_config')
        .update({ 
          enabled_by_superadmin: !currentEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `המודול ${!currentEnabled ? 'הופעל' : 'הושבת'} בהצלחה`,
      });

      refetchModules();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את המודול',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את המודול "${moduleName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('modules_config')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'המודול נמחק בהצלחה',
      });

      refetchModules();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המודול',
        variant: 'destructive',
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Layers className="h-4 w-4" />;
      case 'integration': return <Plug className="h-4 w-4" />;
      case 'management': return <Settings className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'integration': return 'bg-purple-100 text-purple-800';
      case 'management': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען מודולים...</p>
        </div>
      </div>
    );
  }

  const enabledModules = moduleConfigs?.filter(m => m.enabled_by_superadmin) || [];
  const coreModules = moduleConfigs?.filter(m => m.is_core_module) || [];
  const integrationModules = moduleConfigs?.filter(m => m.requires_integration) || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ניהול קונפיגורציית מודולים</h1>
          <p className="text-gray-600 mt-2">
            נהל את כל המודולים הזמינים במערכת והגדר את הזמינות שלהם
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              הוסף מודול חדש
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוסף מודול חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>מפתח מודול</Label>
                <Input placeholder="example-module" />
              </div>
              <div>
                <Label>שם המודול</Label>
                <Input placeholder="מודול לדוגמה" />
              </div>
              <div>
                <Label>תיאור</Label>
                <Textarea placeholder="תיאור המודול..." />
              </div>
              <div>
                <Label>נתיב</Label>
                <Input placeholder="/{businessId}/example" />
              </div>
              <Button className="w-full">
                הוסף מודול
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-gray-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {moduleConfigs?.length || 0}
                </p>
                <p className="text-gray-600">סך הכל מודולים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {enabledModules.length}
                </p>
                <p className="text-gray-600">מודולים פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Layers className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {coreModules.length}
                </p>
                <p className="text-gray-600">מודולי ליבה</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plug className="h-8 w-8 text-purple-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {integrationModules.length}
                </p>
                <p className="text-gray-600">אינטגרציות</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules List */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת מודולים</CardTitle>
          <CardDescription>
            נהל את כל המודולים הזמינים במערכת
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {moduleConfigs?.map(module => (
              <div key={module.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl">{module.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {module.module_name}
                        </h3>
                        <Badge variant="outline" className={getCategoryColor(module.category)}>
                          {getCategoryIcon(module.category)}
                          <span className="mr-1">{module.category}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {module.module_key}
                        </Badge>
                        {module.is_core_module && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            מודול ליבה
                          </Badge>
                        )}
                        {module.requires_integration && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                            דורש אינטגרציה
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={module.enabled_by_superadmin}
                      onCheckedChange={() => handleToggleModule(module.id, module.enabled_by_superadmin)}
                    />
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedModule(module);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteModule(module.id, module.module_name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
