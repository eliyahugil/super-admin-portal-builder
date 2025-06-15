
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export const useEmployeeDocuments = (employeeId: string) => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const { profile } = useAuth();

  // Determine if we're in template mode (when employeeId is empty or falsy)
  const isTemplateMode = !employeeId;
  const queryKey = isTemplateMode 
    ? ['employee-documents-templates'] 
    : ['employee-documents', employeeId];

  console.log('🔍 useEmployeeDocuments - Mode:', { isTemplateMode, employeeId, profileId: profile?.id });

  // שליפת מסמכים עם מידע על חתימות
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('📥 Starting documents query for mode:', isTemplateMode ? 'templates' : 'employee');
      
      let query = supabase
        .from('employee_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name),
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
        // עבור תבניות - רק מסמכים עם is_template = true
        console.log('🎯 Querying templates only');
        query = query.eq('is_template', true);
      } else {
        // עבור עובד ספציפי - רק מסמכים של העובד הזה
        console.log('🎯 Querying documents for employee:', employeeId);
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }
      
      console.log('✅ Documents fetched:', data?.length || 0, 'documents');
      console.log('📋 Documents details:', data);
      
      return data || [];
    },
    enabled: true, // תמיד מאופשר
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
