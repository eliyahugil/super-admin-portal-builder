
import { supabase } from '@/integrations/supabase/client';
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

interface ModuleActionsProps {
  toast: any;
  fetchModules: () => void;
}

export const useModuleActions = ({ toast, fetchModules }: ModuleActionsProps) => {
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המודל? פעולה זו תסיר את המודל מכל העסקים ותמחק את כל הנתונים הקשורים אליו.')) {
      return;
    }

    try {
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

      if (moduleData?.is_custom) {
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

  return {
    handleDeleteModule,
    handleToggleActive
  };
};
