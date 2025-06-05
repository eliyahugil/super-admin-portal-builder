
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Settings,
  Search,
  Building2,
  CheckCircle,
  XCircle,
  Wrench
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateModuleDialog } from './CreateModuleDialog';
import { EditModuleDialog } from './EditModuleDialog';
import { ModuleBusinessDialog } from './ModuleBusinessDialog';
import { ModuleCard } from './ModuleCard';
import { CustomModuleCreator } from './CustomModuleCreator';
import { CustomModuleViewer } from './CustomModuleViewer';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  is_active: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export const ModuleManagement: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [customModuleCreatorOpen, setCustomModuleCreatorOpen] = useState(false);
  const [customModuleViewerOpen, setCustomModuleViewerOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    const filtered = modules.filter(module =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredModules(filtered);
  }, [searchTerm, modules]);

  const ensureEmployeeModuleExists = async () => {
    try {
      // Check if Employee Management module exists
      const { data: existingModule, error: checkError } = await supabase
        .from('modules')
        .select('*')
        .eq('route', '/employees')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for employee module:', checkError);
        return;
      }

      if (!existingModule) {
        console.log('Employee module not found, creating it...');
        // Create the Employee Management module
        const { error: insertError } = await supabase
          .from('modules')
          .insert({
            name: 'ניהול עובדים וסניפים',
            description: 'מודל לניהול עובדים, סניפים, משמרות ונוכחות',
            icon: '👥',
            route: '/employees',
            is_active: true,
          });

        if (insertError) {
          console.error('Error creating employee module:', insertError);
        } else {
          console.log('Employee module created successfully');
        }
      } else {
        console.log('Employee module already exists:', existingModule);
      }
    } catch (error) {
      console.error('Error in ensureEmployeeModuleExists:', error);
    }
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      
      // First ensure the employee module exists
      await ensureEmployeeModuleExists();
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching modules:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את המודלים',
          variant: 'destructive',
        });
        return;
      }

      console.log('Fetched modules:', data);
      setModules(data || []);
    } catch (error) {
      console.error('Error in fetchModules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateCustomModule = () => {
    setCustomModuleCreatorOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setEditDialogOpen(true);
  };

  const handleManageBusinesses = (module: Module) => {
    setSelectedModule(module);
    setBusinessDialogOpen(true);
  };

  const handleViewCustomModule = (module: Module) => {
    setSelectedModule(module);
    setCustomModuleViewerOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המודל? פעולה זו תסיר את המודל מכל העסקים.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) {
        console.error('Error deleting module:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן למחוק את המודל',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: 'המודל נמחק בהצלחה',
      });

      fetchModules();
    } catch (error) {
      console.error('Error in handleDeleteModule:', error);
    }
  };

  const handleToggleActive = async (moduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ is_active: !currentStatus })
        .eq('id', moduleId);

      if (error) {
        console.error('Error updating module status:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לעדכן את סטטוס המודל',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: `המודל ${!currentStatus ? 'הופעל' : 'הושבת'} בהצלחה`,
      });

      fetchModules();
    } catch (error) {
      console.error('Error in handleToggleActive:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען מודלים...</p>
        </div>
      </div>
    );
  }

  const customModules = modules.filter(m => m.is_custom);
  const systemModules = modules.filter(m => !m.is_custom);

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול מודלים</h1>
          <p className="text-gray-600">נהל את כל המודלים הזמינים במערכת והגדר אילו מודלים זמינים לכל עסק</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">סך הכל מודלים</p>
                  <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">מודלים פעילים</p>
                  <p className="text-2xl font-bold text-green-600">
                    {modules.filter(m => m.is_active).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">מודלים לא פעילים</p>
                  <p className="text-2xl font-bold text-red-600">
                    {modules.filter(m => !m.is_active).length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">מודלים עם נתיב</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {modules.filter(m => m.route).length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">מודלים מותאמים</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {customModules.length}
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>רשימת מודלים</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleCreateCustomModule} variant="outline" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  <span>צור מודל מותאם אישית</span>
                </Button>
                <Button onClick={handleCreateModule} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>צור מודל רגיל</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search">חיפוש מודלים</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="חפש לפי שם או תיאור..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {filteredModules.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'לא נמצאו מודלים' : 'אין מודלים'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'נסה לשנות את מונחי החיפוש' 
                    : 'התחל על ידי יצירת המודל הראשון'
                  }
                </p>
                {!searchTerm && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleCreateCustomModule} variant="outline">צור מודל מותאם אישית</Button>
                    <Button onClick={handleCreateModule}>צור מודל רגיל</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Custom Modules Section */}
                {customModules.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-600" />
                      מודלים מותאמים אישית ({customModules.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {customModules.map((module) => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          onEdit={handleEditModule}
                          onManageBusinesses={handleManageBusinesses}
                          onToggleActive={handleToggleActive}
                          onDelete={handleDeleteModule}
                          onViewCustomModule={handleViewCustomModule}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* System Modules Section */}
                {systemModules.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      מודלי מערכת ({systemModules.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {systemModules.map((module) => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          onEdit={handleEditModule}
                          onManageBusinesses={handleManageBusinesses}
                          onToggleActive={handleToggleActive}
                          onDelete={handleDeleteModule}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreateModuleDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={fetchModules}
        />
        
        <EditModuleDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          module={selectedModule}
          onSuccess={fetchModules}
        />
        
        <ModuleBusinessDialog
          open={businessDialogOpen}
          onOpenChange={setBusinessDialogOpen}
          module={selectedModule}
        />

        <CustomModuleCreator
          open={customModuleCreatorOpen}
          onOpenChange={setCustomModuleCreatorOpen}
          onSuccess={fetchModules}
        />

        <CustomModuleViewer
          open={customModuleViewerOpen}
          onOpenChange={setCustomModuleViewerOpen}
          module={selectedModule}
        />
      </div>
    </div>
  );
};
