
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  getCustomerNumberForUser,
  createCustomModuleWithTable
} from '@/utils/moduleUtils';
import type { CustomField, SubModule } from '@/utils/moduleTypes';
import { ModuleBasicInfo } from './creator/ModuleBasicInfo';
import { ModuleFieldsBuilder } from './creator/ModuleFieldsBuilder';
import { SubModulesBuilder } from './creator/SubModulesBuilder';
import { ModuleValidation, useModuleValidation } from './creator/ModuleValidation';

interface CustomModuleCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CustomModuleCreator: React.FC<CustomModuleCreatorProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleIcon, setModuleIcon] = useState('📋');
  const [fields, setFields] = useState<CustomField[]>([]);
  const [subModules, setSubModules] = useState<SubModule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validation = useModuleValidation(moduleName, fields, subModules);

  const handleCreate = async () => {
    if (!validation.isValid) {
      toast({
        title: 'שגיאה',
        description: 'יש לתקן את השגיאות לפני יצירת המודל',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting custom module creation...');
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        toast({
          title: 'שגיאה',
          description: 'משתמש לא מזוהה',
          variant: 'destructive'
        });
        return;
      }

      // Use the enhanced creation function with sub-modules
      const result = await createCustomModuleWithTable(
        moduleName,
        moduleDescription,
        fields,
        subModules,
        userData.user.id
      );

      if (!result.success) {
        toast({
          title: 'שגיאה',
          description: result.error || 'לא ניתן ליצור את המודל',
          variant: 'destructive'
        });
        return;
      }

      const customerNumber = await getCustomerNumberForUser(userData.user.id);
      const customerText = customerNumber === 0 ? 'מנהל על (0)' : customerNumber.toString();
      const subModulesText = subModules.length > 0 ? ` עם ${subModules.length} תת-מודלים` : '';
      
      toast({
        title: 'הצלחה',
        description: `המודל "${moduleName}" נוצר בהצלחה עם מספר לקוח ${customerText}${subModulesText}`,
      });

      // Reset form
      setModuleName('');
      setModuleDescription('');
      setModuleIcon('📋');
      setFields([]);
      setSubModules([]);
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleCreate:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            יצירת מודל מותאם אישית
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Module Basic Info */}
          <ModuleBasicInfo
            moduleName={moduleName}
            moduleDescription={moduleDescription}
            moduleIcon={moduleIcon}
            onModuleNameChange={setModuleName}
            onModuleDescriptionChange={setModuleDescription}
            onModuleIconChange={setModuleIcon}
          />

          {/* Sub-Modules */}
          <SubModulesBuilder
            subModules={subModules}
            onSubModulesChange={setSubModules}
          />

          {/* Fields Definition */}
          <ModuleFieldsBuilder
            fields={fields}
            onFieldsChange={setFields}
          />

          {/* Validation */}
          <ModuleValidation
            moduleName={moduleName}
            fields={fields}
            subModules={subModules}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading || !validation.isValid}
              className="flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Sparkles className="h-4 w-4" />
              צור מודל
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
