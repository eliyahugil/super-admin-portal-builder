
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const useEmployeeDocumentUpload = (
  employeeId: string | undefined,
  queryKey: any[],
  onSuccess?: () => void
) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isTemplate: boolean = false
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    // עבור מסמכים רגילים (לא תבניות), חובה employeeId או שזה לא תבנית
    if (!isTemplate && !employeeId) {
      console.log('⚠️ Uploading regular document without specific employee - this will be a general document');
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const folderPath = isTemplate ? 'templates' : 'signature-documents';
      const filePath = `${folderPath}/${fileName}`;

      console.log('📁 Uploading to bucket: employee-files, path:', filePath, 'isTemplate:', isTemplate);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded successfully:', uploadData.path);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      // Create document record - הלוגיקה המתוקנת
      const documentData = {
        employee_id: isTemplate ? null : (employeeId || null), // עבור תבניות null, עבור מסמכים רגילים employeeId או null
        document_name: file.name,
        document_type: getDocumentType(file.name),
        file_url: publicUrl,
        status: isTemplate ? 'template' : 'pending', // סטטוס שונה
        is_template: isTemplate, // זה הקובע את הסוג!
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      };

      console.log('💾 Saving document with data:', documentData);
      console.log('🔍 is_template value being saved:', isTemplate);

      const { error: dbError } = await supabase
        .from('employee_documents')
        .insert(documentData);

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('employee-files')
          .remove([filePath]);
        throw dbError;
      }

      toast({
        title: 'הצלחה',
        description: isTemplate 
          ? 'התבנית הועלתה בהצלחה!'
          : 'המסמך לחתימה הועלה בהצלחה!',
      });

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey });
      onSuccess?.();

    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בהעלאת המסמך',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  return {
    uploading,
    handleFileUpload,
  };
};

// Helper function to determine document type
const getDocumentType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  
  // Check for Form 101 first
  if (lowerFileName.includes('טופס 101') || lowerFileName.includes('form 101') || lowerFileName.includes('101')) {
    return 'form_101';
  }
  
  // Then check by extension
  if (['pdf'].includes(extension || '')) return 'contract';
  if (['doc', 'docx'].includes(extension || '')) return 'form';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) return 'id';
  if (['txt', 'rtf'].includes(extension || '')) return 'document';
  if (['xlsx', 'xls', 'csv'].includes(extension || '')) return 'spreadsheet';
  
  return 'other';
};
