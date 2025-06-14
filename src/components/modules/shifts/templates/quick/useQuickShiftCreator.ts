
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuickTemplateData, QuickTemplate } from './types';

export const useQuickShiftCreator = (businessId?: string, onTemplateCreated?: () => void) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  
  const [templateData, setTemplateData] = useState<QuickTemplateData>({
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    shift_type: 'morning',
    branch_id: '',
    required_employees: 1,
    role_name: ''
  });

  const handleQuickCreate = async (template: QuickTemplate, branches: any[]) => {
    if (!businessId || !branches || branches.length === 0) {
      toast({
        title: "שגיאה",
        description: "צריך להיות לפחות סניף אחד כדי ליצור תבנית משמרת",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const { data: templateData, error } = await supabase
        .from('shift_templates')
        .insert({
          name: template.name,
          business_id: businessId,
          branch_id: branches[0].id,
          start_time: template.start_time,
          end_time: template.end_time,
          shift_type: template.shift_type,
          required_employees: 1,
          is_active: true,
          is_archived: false,
        })
        .select()
        .single();

      if (error || !templateData) throw error || new Error("כשל ביצירת תבנית");

      toast({
        title: "הצלחה",
        description: `תבנית "${template.name}" נוצרה בהצלחה`
      });

      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה ביצירת התבנית: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomCreate = async () => {
    if (!businessId || !templateData.name || selectedBranches.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים (כולל תפקיד, סניפים)",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const inserts = selectedBranches.map(branchId => ({
        name: templateData.name,
        business_id: businessId,
        branch_id: branchId,
        start_time: templateData.start_time,
        end_time: templateData.end_time,
        shift_type: templateData.shift_type,
        required_employees: templateData.required_employees,
        is_active: true,
        is_archived: false,
        role_name: templateData.role_name || null,
      }));

      const { data: insertedTemplates, error } = await supabase
        .from('shift_templates')
        .insert(inserts)
        .select();

      if (error || !insertedTemplates) throw error || new Error("בעיה בשמירת תבניות");

      toast({
        title: "הצלחה",
        description: `נוצרו ${insertedTemplates.length} תבניות משמרות חדשות`
      });

      // איפוס טופס
      setTemplateData({
        name: '',
        start_time: '09:00',
        end_time: '17:00',
        shift_type: 'morning',
        branch_id: '',
        required_employees: 1,
        role_name: '',
      });
      setSelectedBranches([]);

      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה ביצירת התבניות: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    templateData,
    setTemplateData,
    selectedBranches,
    setSelectedBranches,
    handleQuickCreate,
    handleCustomCreate
  };
};
