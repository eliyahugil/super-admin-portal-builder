
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

    // שליחה לכל עובד שנבחר
    for (const employeeId of selectedEmployeeIds) {
      try {
        // בדיקה אם כבר קיימת חתימה לעובד הזה
        const existingSignature = existingSignatures.find(sig => sig.employee_id === employeeId);
        
        if (existingSignature && !isResending) {
          // אם יש חתימה קיימת ולא מדובר בשליחה מחדש, נדלג
          console.log(`🔄 Signature already exists for employee ${employeeId}, skipping`);
          continue;
        }

        let signatureToken: string;
        
        if (existingSignature) {
          // עדכון חתימה קיימת - אבל רק אם היא לא נחתמה כבר
          if (existingSignature.status === 'signed') {
            console.log(`✅ Employee ${employeeId} already signed, skipping update`);
            continue;
          }
          
          // עדכון חתימה ממתינה בלבד
          signatureToken = crypto.randomUUID();
          const { error: updateError } = await supabase
            .from('employee_document_signatures')
            .update({
              digital_signature_token: signatureToken,
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSignature.id)
            .eq('status', 'pending');

          if (updateError) throw updateError;
        } else {
          // יצירת חתימה חדשה
          signatureToken = crypto.randomUUID();
          const { error: insertError } = await supabase
            .from('employee_document_signatures')
            .insert({
              document_id: documentId,
              employee_id: employeeId,
              digital_signature_token: signatureToken,
              status: 'pending',
              sent_at: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }

        // יצירת קישור חתימה דיגיטלית
        const signUrl = `${baseUrl}/sign-document/${documentId}?token=${signatureToken}`;
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
