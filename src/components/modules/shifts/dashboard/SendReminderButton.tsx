
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShiftSubmission } from '../types';

interface SendReminderButtonProps {
  submissions: ShiftSubmission[] | undefined;
}

export const SendReminderButton: React.FC<SendReminderButtonProps> = ({ submissions }) => {
  const { toast } = useToast();

  const sendReminderToAll = () => {
    const unsubmittedEmployees = submissions?.filter((s: ShiftSubmission) => !s.submitted_at);
    
    if (!unsubmittedEmployees || unsubmittedEmployees.length === 0) {
      toast({
        title: 'אין מה לשלוח',
        description: 'כל העובדים כבר הגישו משמרות',
      });
      return;
    }

    const reminderMessage = `היי! 👋\n\nתזכורת להגשת משמרות לשבוע הקרוב.\n\nאנא הגישו עד סוף היום.\n\nתודה! 🙏`;
    
    unsubmittedEmployees.forEach((emp: ShiftSubmission) => {
      if (emp.employee?.phone) {
        const cleanPhone = emp.employee.phone.replace(/[^\d]/g, '');
        const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
        const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(reminderMessage)}`;
        setTimeout(() => window.open(url, '_blank'), 500);
      }
    });

    toast({
      title: 'תזכורות נשלחו',
      description: `נשלחו תזכורות ל${unsubmittedEmployees.length} עובדים`,
    });
  };

  return (
    <div className="mb-6 flex gap-4">
      <Button
        onClick={sendReminderToAll}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        שלח תזכורת לכולם
      </Button>
    </div>
  );
};
