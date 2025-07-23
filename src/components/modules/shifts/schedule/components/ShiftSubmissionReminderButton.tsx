
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BulkSendMessageDialog } from '@/components/modules/employees/list/BulkSendMessageDialog';
import type { Employee } from '@/types/employee';

interface ShiftSubmissionReminderButtonProps {
  employees: Employee[];
  businessId?: string | null;
}

export const ShiftSubmissionReminderButton: React.FC<ShiftSubmissionReminderButtonProps> = ({
  employees,
  businessId
}) => {
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { toast } = useToast();

  const activeEmployees = employees.filter(emp => 
    emp.is_active !== false && 
    emp.is_archived !== true &&
    emp.phone // רק עובדים עם טלפון
  );

  const sendQuickReminder = () => {
    if (activeEmployees.length === 0) {
      toast({
        title: 'אין עובדים זמינים',
        description: 'לא נמצאו עובדים פעילים עם מספר טלפון',
        variant: 'destructive'
      });
      return;
    }

    const reminderMessage = `שלום! 👋

תזכורת חשובה להגשת משמרות לשבוע הקרוב.

🗓️ אנא הגישו את בקשות המשמרות שלכם בהקדם האפשרי.

⏰ המועד האחרון להגשה: עד סוף היום!

תודה על שיתוף הפעולה! 🙏

צוות הניהול`;

    let sentCount = 0;
    activeEmployees.forEach((employee, index) => {
      if (employee.phone) {
        const cleanPhone = employee.phone.replace(/[^\d]/g, '');
        const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
        const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(reminderMessage)}`;
        
        // פתיחה עם דילאי קטן בין חלונות
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, index * 300);
        
        sentCount++;
      }
    });

    toast({
      title: 'תזכורות נשלחו! 📱',
      description: `WhatsApp נפתח עבור ${sentCount} עובדים`,
    });
  };

  const handleMessageSuccess = () => {
    setShowMessageDialog(false);
    toast({
      title: 'הצלחה! ✅',
      description: 'ההודעות נשלחו בהצלחה לכל העובדים',
    });
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button
          onClick={sendQuickReminder}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          disabled={activeEmployees.length === 0}
        >
          <Send className="h-4 w-4" />
          שלח תזכורת מהירה
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
            {activeEmployees.length}
          </span>
        </Button>

        <Button
          onClick={() => setShowMessageDialog(true)}
          variant="outline"
          className="flex items-center gap-2"
          disabled={activeEmployees.length === 0}
        >
          <MessageSquare className="h-4 w-4" />
          הודעה מותאמת אישית
        </Button>

        <div className="flex items-center gap-2 text-sm text-gray-600 px-3">
          <Users className="h-4 w-4" />
          {activeEmployees.length} עובדים פעילים עם טלפון
        </div>
      </div>

      {activeEmployees.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Users className="h-5 w-5" />
            <span className="font-medium">אין עובדים זמינים לשליחת הודעות</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            נדרש לפחות עובד אחד פעיל עם מספר טלפון כדי לשלוח הודעות
          </p>
        </div>
      )}

      <BulkSendMessageDialog
        employees={activeEmployees}
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        onSuccess={handleMessageSuccess}
      />
    </>
  );
};
