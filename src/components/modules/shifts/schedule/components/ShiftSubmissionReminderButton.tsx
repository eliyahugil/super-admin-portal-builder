
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from '../types';

interface ShiftSubmissionReminderButtonProps {
  employees: Employee[];
  businessId?: string | null;
}

export const ShiftSubmissionReminderButton: React.FC<ShiftSubmissionReminderButtonProps> = ({
  employees,
  businessId
}) => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendReminder = async () => {
    if (!businessId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה עסק",
        variant: "destructive"
      });
      return;
    }

    if (employees.length === 0) {
      toast({
        title: "אין עובדים",
        description: "לא נמצאו עובדים פעילים לשליחת תזכורת",
        variant: "destructive"
      });
      return;
    }

    setSending(true);

    try {
      console.log('📤 Sending shift submission reminders to employees:', {
        businessId,
        employeeCount: employees.length,
        employees: employees.map(emp => ({ id: emp.id, name: `${emp.first_name} ${emp.last_name}` }))
      });

      // Call the edge function to send reminders
      const { data, error } = await supabase.functions.invoke('send-shift-reminders', {
        body: {
          businessId,
          employeeIds: employees.map(emp => emp.id)
        }
      });

      if (error) {
        console.error('❌ Error sending reminders:', error);
        throw error;
      }

      console.log('✅ Reminders sent successfully:', data);

      toast({
        title: "תזכורות נשלחו בהצלחה!",
        description: `נשלחו תזכורות ל-${employees.length} עובדים להגשת משמרות`,
      });

    } catch (error: any) {
      console.error('💥 Error sending shift submission reminders:', error);
      toast({
        title: "שגיאה בשליחת תזכורות",
        description: error.message || "שגיאה לא צפויה בשליחת התזכורות",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (!businessId || employees.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">תזכורת הגשת משמרות</h3>
            <p className="text-sm text-blue-700">
              שלח תזכורת ל-{employees.length} עובדים להגיש את משמרותיהם השבועיות
            </p>
          </div>
        </div>
        <Button
          onClick={handleSendReminder}
          disabled={sending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              שולח...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              שלח תזכורות
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
