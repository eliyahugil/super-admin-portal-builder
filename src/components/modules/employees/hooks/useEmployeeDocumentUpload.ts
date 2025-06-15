
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { getFileType } from '../helpers/documentHelpers';
import { StorageService } from '@/services/StorageService';

/**
 * Hook להעלאת מסמכים לעובד ספציפי או תבניות
 */
export const useEmployeeDocumentUpload = (
  employeeId: string | undefined,
  queryKeyForInvalidate: any[],
  onUploadSuccess?: () => void
) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!profile?.id && !user?.id) {
      toast({
        title: 'שגיאה',
        description: 'נדרש להתחבר למערכת כדי להעלות קבצים',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setUploading(true);
      const isTemplate = !employeeId;
      
      console.log('🔍 Starting document upload process...', { 
        employeeId, 
        isTemplate,
        fileName: file.name,
        fileSize: file.size 
      });
      
      // בדיקת גישה לדלי
      const hasAccess = await StorageService.checkBucketAccess();
      if (!hasAccess) {
        throw new Error('מערכת האחסון אינה זמינה. אנא נסה שוב מאוחר יותר או פנה לתמיכה.');
      }

      // אימות סשן
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('לא קיימת חיבור פעיל למערכת');
      }

      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      // אם זה עובד ספציפי, שמור בתיקיה שלו, אחרת בתיקיית תבניות
      const filePath = employeeId 
        ? `employee-documents/${employeeId}/${fileName}`
        : `employee-documents/templates/${fileName}`;

      console.log('📁 Uploading to path:', filePath);

      // העלאת קובץ ל-Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`שגיאה בהעלאת הקובץ: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData.path);

      // קבלת URL ציבורי לקובץ
      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('לא ניתן ליצור קישור לקובץ');
      }

      const uploadedBy = profile?.id || user?.id;
      console.log('💾 Saving document record to database...', {
        employee_id: employeeId || null,
        is_template: isTemplate,
        document_name: file.name,
        uploaded_by: uploadedBy
      });

      // שמירת רשומת המסמך למסד הנתונים
      const { data: insertedDoc, error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId || null,
          assignee_id: null,
          document_name: file.name,
          document_type: getFileType(file.name),
          file_url: urlData.publicUrl,
          uploaded_by: uploadedBy,
          is_template: isTemplate,
          status: employeeId ? 'pending' : 'template',
          reminder_count: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Database insert error:', insertError);
        // ניסיון לנקות את הקובץ שהועלה אם השמירה למסד הנתונים נכשלה
        await supabase.storage.from('employee-files').remove([uploadData.path]);
        throw new Error(`שגיאה בשמירת המסמך: ${insertError.message}`);
      }

      console.log('✅ Document record saved successfully:', insertedDoc);

      toast({
        title: 'הצלחה',
        description: employeeId ? 'המסמך הועלה בהצלחה!' : 'התבנית הועלתה בהצלחה!',
      });

      // רענון רשימת המסמכים - כמה שיטות כדי לוודא שזה עובד
      console.log('🔄 Invalidating queries with key:', queryKeyForInvalidate);
      
      // רענון ישיר של הקיוורי הספציפי
      await queryClient.invalidateQueries({ queryKey: queryKeyForInvalidate });
      
      // רענון כל הקיוורי של מסמכי עובדים
      await queryClient.invalidateQueries({ 
        queryKey: ['employee-documents-templates'] 
      });
      
      // קריאה לקולבק נוסף אם הועבר
      if (onUploadSuccess) {
        console.log('📞 Calling upload success callback');
        onUploadSuccess();
      }
      
      // חכה קצת ואז רענן שוב לוודא
      setTimeout(() => {
        console.log('🔄 Secondary refresh after upload');
        queryClient.invalidateQueries({ queryKey: queryKeyForInvalidate });
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('💥 Upload error:', error);
      toast({
        title: 'שגיאה',
        description: error?.message ?? 'שגיאה בהעלאת המסמך',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return { uploading, handleFileUpload };
};
