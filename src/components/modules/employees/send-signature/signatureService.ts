
import { supabase } from '@/integrations/supabase/client';
import type { ExistingSignature, SendToSignatureResult } from './types';

export class SignatureService {
  static async sendToSignature(
    documentId: string,
    selectedEmployeeIds: string[],
    existingSignatures: ExistingSignature[],
    isResending: boolean = false
  ): Promise<SendToSignatureResult> {
    console.log('📤 Sending document to signature:', { 
      documentId, 
      selectedEmployeeIds, 
      isResending 
    });
    
    const baseUrl = window.location.origin;
    const signatureUrls: { [employeeId: string]: string } = {};
    let successCount = 0;
    let errorCount = 0;

    // קודם נבדק אם זו תבנית ונשלוף גם את העסק
    const { data: templateDoc, error: templateError } = await supabase
      .from('employee_documents')
      .select(`
        *,
        uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(business_id)
      `)
      .eq('id', documentId)
      .single();

    if (templateError) {
      console.error('❌ Error fetching template document:', templateError);
      throw templateError;
    }

    const isTemplate = templateDoc.is_template;
    console.log('🎯 Document is template:', isTemplate);

    // נמצא את ה-business_id
    let businessId = null;
    if (isTemplate) {
      businessId = templateDoc.uploaded_by_profile?.business_id;
    } else {
      // עבור מסמכים רגילים, נמצא את ה-business_id דרך העובד
      if (templateDoc.employee_id) {
        const { data: employee } = await supabase
          .from('employees')
          .select('business_id')
          .eq('id', templateDoc.employee_id)
          .single();
        businessId = employee?.business_id;
      }
    }

    console.log('🏢 Business ID:', businessId);

    // שליחה לכל עובד שנבחר
    for (const employeeId of selectedEmployeeIds) {
      try {
        let targetDocumentId = documentId;

        // אם זו תבנית, ניצור מסמך חדש לכל עובד
        if (isTemplate) {
          console.log(`📋 Creating new document from template for employee ${employeeId}`);
          
          const { data: newDocument, error: createError } = await supabase
            .from('employee_documents')
            .insert({
              document_name: templateDoc.document_name,
              document_type: templateDoc.document_type,
              file_url: templateDoc.file_url,
              status: 'pending',
              is_template: false, // זה מסמך רגיל, לא תבנית
              employee_id: employeeId,
              assignee_id: employeeId,
              uploaded_by: templateDoc.uploaded_by,
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creating document from template:', createError);
            throw createError;
          }

          targetDocumentId = newDocument.id;
          console.log(`✅ Created new document ${targetDocumentId} from template for employee ${employeeId}`);
        } else {
          // עבור מסמכים רגילים (לא תבניות), נבדק אם כבר קיימת חתימה
          const existingSignature = existingSignatures.find(sig => sig.employee_id === employeeId);
          
          if (existingSignature && !isResending) {
            console.log(`🔄 Signature already exists for employee ${employeeId}, skipping`);
            continue;
          }

          if (existingSignature && existingSignature.status === 'signed') {
            console.log(`✅ Employee ${employeeId} already signed, skipping update`);
            continue;
          }
        }

        // יצירת טוקן חתימה חדש
        const signatureToken = crypto.randomUUID();

        // בדיקה אם יש חתימה קיימת למסמך החדש/קיים
        const { data: existingSignatureForDoc } = await supabase
          .from('employee_document_signatures')
          .select('*')
          .eq('document_id', targetDocumentId)
          .eq('employee_id', employeeId)
          .single();

        if (existingSignatureForDoc && !isResending) {
          console.log(`🔄 Signature already exists for document ${targetDocumentId} and employee ${employeeId}`);
          continue;
        }

        if (existingSignatureForDoc && isResending) {
          // עדכון חתימה קיימת
          const { error: updateError } = await supabase
            .from('employee_document_signatures')
            .update({
              digital_signature_token: signatureToken,
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSignatureForDoc.id);

          if (updateError) throw updateError;
        } else {
          // יצירת חתימה חדשה
          const { error: insertError } = await supabase
            .from('employee_document_signatures')
            .insert({
              document_id: targetDocumentId,
              employee_id: employeeId,
              digital_signature_token: signatureToken,
              status: 'pending',
              sent_at: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }

        // יצירת קישור חתימה דיגיטלית
        const signUrl = `${baseUrl}/sign-document/${targetDocumentId}?token=${signatureToken}`;
        signatureUrls[employeeId] = signUrl;
        successCount++;
        
        console.log(`✅ Document sent successfully to employee ${employeeId}, signature URL:`, signUrl);
      } catch (employeeError) {
        console.error(`❌ Error sending to employee ${employeeId}:`, employeeError);
        errorCount++;
      }
    }

    return {
      successCount,
      errorCount,
      signatureUrls,
    };
  }
}
