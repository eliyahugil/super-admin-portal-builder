
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook לשימוש בלוגיקת שליחת/שליפת תזכורות למסמכי עובד
 */
export const useEmployeeDocumentReminders = (employeeId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reminderLoading, setReminderLoading] = useState<string | null>(null);
  const [reminderLog, setReminderLog] = useState<Record<string, any[]>>({});

  // שליפת לוג תזכורות עבור מסמך מסוים
  const fetchReminders = async (docId: string) => {
    const { data, error } = await supabase
      .from('employee_document_reminders')
      .select('id, sent_at, message, reminder_type, sent_by')
      .eq('document_id', docId)
      .order('sent_at', { ascending: false });
    if (!error) setReminderLog((prev) => ({ ...prev, [docId]: data ?? [] }));
  };

  // שליחת תזכורת
  const sendReminder = async (document: any) => {
    setReminderLoading(document.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('No authenticated user!');
      const { error } = await supabase
        .from('employee_document_reminders')
        .insert({
          document_id: document.id,
          employee_id: document.employee_id,
          sent_by: user.id,
          reminder_type: 'system',
          message: `תזכורת נשלחה על ידי מנהל המערכת בתאריך ${new Date().toLocaleString('he-IL')}`,
        });
      if (error) throw error;

      await supabase.from('employee_documents').update({
        reminder_count: (document.reminder_count ?? 0) + 1,
        reminder_sent_at: new Date().toISOString()
      }).eq('id', document.id);

      toast({
        title: 'תזכורת נשלחה',
        description: 'נשלחה תזכורת לעובד עבור מסמך זה',
      });
      await fetchReminders(document.id);
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
    } catch (e: any) {
      toast({
        title: 'שגיאה בשליחת תזכורת',
        description: e.message ?? 'תקלה בשליחת התזכורת. נסו שוב.',
        variant: 'destructive',
      });
    } finally {
      setReminderLoading(null);
    }
  };

  return { reminderLog, reminderLoading, fetchReminders, sendReminder, setReminderLog };
};
