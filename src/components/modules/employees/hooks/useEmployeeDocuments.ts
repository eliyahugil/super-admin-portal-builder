
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const useEmployeeDocuments = (employeeId: string) => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const { profile } = useAuth();
  const { businessId } = useCurrentBusiness();

  // Determine if we're in template mode (when employeeId is empty or falsy)
  const isTemplateMode = !employeeId;
  const queryKey = isTemplateMode 
    ? ['employee-documents-templates', businessId] 
    : ['employee-documents', employeeId, businessId];

  console.log('🔍 useEmployeeDocuments - Mode:', { isTemplateMode, employeeId, businessId, profileId: profile?.id });

  // שליפת מסמכים עם מידע על חתימות
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('📥 Starting documents query for mode:', isTemplateMode ? 'templates' : 'employee');
      
      if (!businessId) {
        console.log('❌ No business ID available');
        return [];
      }
      
      let query = supabase
        .from('employee_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name),
          employee:employees!employee_documents_employee_id_fkey(
            id,
            first_name,
            last_name,
            employee_id
          ),
          assignee:employees!employee_documents_assignee_id_fkey(
            id,
            first_name,
            last_name,
            employee_id
          ),
          signatures:employee_document_signatures(
            id,
            employee_id,
            status,
            signed_at,
            sent_at,
            employee:employees!employee_document_signatures_employee_id_fkey(
              id,
              first_name,
              last_name,
              employee_id
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (isTemplateMode) {
        // עבור תבניות - רק מסמכים עם is_template = true מהעסק הנוכחי
        console.log('🎯 Querying templates only for business:', businessId);
        
        // קודם נמצא את כל העובדים של העסק
        const { data: businessEmployees } = await supabase
          .from('employees')
          .select('id')
          .eq('business_id', businessId)
          .eq('is_active', true);

        const businessEmployeeIds = businessEmployees?.map(emp => emp.id) || [];
        
        // עכשיו נשלוף תבניות וגם מסמכים שנוצרו מתבניות לעובדים של העסק
        query = query.and(
          `or(and(is_template.eq.true,uploaded_by.eq.${profile?.id}),and(is_template.eq.false,employee_id.in.(${businessEmployeeIds.join(',')})))`
        );
      } else {
        // עבור עובד ספציפי - כל המסמכים שקשורים אליו (כולל שנשלחו אליו לחתימה)
        // אבל לא תבניות
        console.log('🎯 Querying documents for employee:', employeeId);
        query = query
          .eq('is_template', false)
          .or(`employee_id.eq.${employeeId},assignee_id.eq.${employeeId}`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }
      
      console.log('✅ Documents fetched:', data?.length || 0, 'documents');
      console.log('📋 Documents details:', data?.map(d => ({
        id: d.id,
        name: d.document_name,
        isTemplate: d.is_template,
        employeeId: d.employee_id,
        assigneeId: d.assignee_id,
        signaturesCount: d.signatures?.length || 0
      })));
      
      return data || [];
    },
    enabled: !!businessId, // צריך business ID
  });

  return {
    documents,
    isLoading,
    refetch,
    selectedDocument,
    setSelectedDocument,
    isTemplateMode,
    queryKey
  };
};
