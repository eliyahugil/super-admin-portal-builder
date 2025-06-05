
import { supabase } from '@/integrations/supabase/client';

// Clean up module data when deleting a custom module
export const cleanupModuleData = async (moduleId: string, tableName?: string): Promise<boolean> => {
  try {
    console.log('Starting cleanup for module:', moduleId, 'table:', tableName);

    // Remove module from all businesses
    const { error: businessModuleError } = await supabase
      .from('business_modules')
      .delete()
      .eq('module_id', moduleId) as any;

    if (businessModuleError) {
      console.error('Error removing module from businesses:', businessModuleError);
      return false;
    }

    // If it's a custom module with a table, attempt to drop the table
    if (tableName) {
      try {
        // Use the SQL function to drop the custom table
        const dropResult = await (supabase as any).rpc('drop_custom_table', { 
          table_name: tableName 
        });

        if (dropResult.error) {
          console.warn('Could not drop custom table:', dropResult.error);
          // Continue execution - table deletion is not critical
        } else {
          console.log('Successfully dropped custom table:', tableName, 'Result:', Boolean(dropResult.data));
        }
      } catch (tableError) {
        console.warn('Table deletion failed:', tableError);
        // Continue execution - table deletion is not critical
      }
    }

    return true;
  } catch (error) {
    console.error('Error in cleanupModuleData:', error);
    return false;
  }
};
