
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateModuleDialog } from './CreateModuleDialog';
import { EditModuleDialog } from './EditModuleDialog';
import { ModuleBusinessDialog } from './ModuleBusinessDialog';
import { CustomModuleCreator } from './CustomModuleCreator';
import { CustomModuleViewer } from './CustomModuleViewer';
import { ModuleStatsCards } from './ModuleStatsCards';
import { ModuleSearchControls } from './ModuleSearchControls';
import { ModuleEmptyState } from './ModuleEmptyState';
import { ModuleGrid } from './ModuleGrid';
import { cleanupModuleData } from '@/utils/moduleUtils';

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
  module_config?: any;
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

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המודל? פעולה זו תסיר את המודל מכל העסקים ותמחק את כל הנתונים הקשורים אליו.')) {
      return;
    }

    try {
      // Get module data first to extract table name
      const { data: moduleData, error: moduleDataError } = await supabase
        .from('modules')
        .select('module_config, is_custom')
        .eq('id', moduleId)
        .single();

      if (moduleDataError) {
        console.error('Error fetching module data:', moduleDataError);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לקרוא נתוני המודל',
          variant: 'destructive'
        });
        return;
      }

      // For custom modules, clean up associated data and tables
      if (moduleData?.is_custom) {
        // Safely access table_name from module_config
        const tableName = typeof moduleData.module_config === 'object' && 
                         moduleData.module_config !== null &&
                         'table_name' in moduleData.module_config
                         ? (moduleData.module_config as any).table_name
                         : undefined;
        
        console.log('Cleaning up custom module with table:', tableName);
        
        const cleanupSuccess = await cleanupModuleData(moduleId, tableName);
        if (!cleanupSuccess) {
          toast({
            title: 'אזהרה',
            description: 'חלק מהנתונים הקשורים למודל לא נמחקו במלואם',
            variant: 'destructive'
          });
        }
      }

      // Delete the module itself
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) {
        console.error('Error deleting module:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן למחוק את המודל',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: 'המודל והנתונים הקשורים אליו נמחקו בהצלחה',
      });

      fetchModules();
    } catch (error) {
      console.error('Error in handleDeleteModule:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה במחיקת המודל',
        variant: 'destructive'
      });
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

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול מודלים</h1>
          <p className="text-gray-600">נהל את כל המודלים הזמינים במערכת והגדר אילו מודלים זמינים לכל עסק</p>
        </div>

        {/* Stats Cards */}
        <ModuleStatsCards modules={modules} />

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>רשימת מודלים</CardTitle>
          </CardHeader>
          <CardContent>
            <ModuleSearchControls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onCreateModule={() => setCreateDialogOpen(true)}
              onCreateCustomModule={() => setCustomModuleCreatorOpen(true)}
            />

            {filteredModules.length === 0 ? (
              <ModuleEmptyState
                searchTerm={searchTerm}
                onCreateModule={() => setCreateDialogOpen(true)}
                onCreateCustomModule={() => setCustomModuleCreatorOpen(true)}
              />
            ) : (
              <ModuleGrid
                modules={filteredModules}
                onEdit={handleEditModule}
                onManageBusinesses={handleManageBusinesses}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteModule}
                onViewCustomModule={handleViewCustomModule}
              />
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
