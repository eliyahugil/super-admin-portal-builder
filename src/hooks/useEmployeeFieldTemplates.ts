
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';

export interface EmployeeFieldTemplate {
  id: string;
  business_id: string;
  field_name: string;
  field_type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'boolean' | 'select';
  field_options?: string[];
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useEmployeeFieldTemplates = () => {
  const { businessId } = useBusiness();
  const { toast } = useToast();

  const { data: fieldTemplates, isLoading, refetch } = useQuery({
    queryKey: ['employee-field-templates', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('employee_field_templates')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching field templates:', error);
        throw error;
      }

      return data as EmployeeFieldTemplate[];
    },
    enabled: !!businessId,
  });

  const createFieldTemplate = async (fieldData: Omit<EmployeeFieldTemplate, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('employee_field_templates')
        .insert({
          ...fieldData,
          business_id: businessId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'השדה נוצר בהצלחה',
      });

      refetch();
      return data;
    } catch (error: any) {
      console.error('Error creating field template:', error);
      toast({
        title: 'שגיאה',
        description: `שגיאה ביצירת השדה: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateFieldTemplate = async (id: string, updates: Partial<EmployeeFieldTemplate>) => {
    try {
      const { error } = await supabase
        .from('employee_field_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'השדה עודכן בהצלחה',
      });

      refetch();
    } catch (error: any) {
      console.error('Error updating field template:', error);
      toast({
        title: 'שגיאה',
        description: `שגיאה בעדכון השדה: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const deleteFieldTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_field_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'השדה נמחק בהצלחה',
      });

      refetch();
    } catch (error: any) {
      console.error('Error deleting field template:', error);
      toast({
        title: 'שגיאה',
        description: `שגיאה במחיקת השדה: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return {
    fieldTemplates: fieldTemplates || [],
    isLoading,
    refetch,
    createFieldTemplate,
    updateFieldTemplate,
    deleteFieldTemplate,
  };
};
