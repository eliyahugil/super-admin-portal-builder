
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Users } from 'lucide-react';
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
    
    let sentCount = 0;
    unsubmittedEmployees.forEach((emp: ShiftSubmission, index: number) => {
      if (emp.employee?.phone) {
        const cleanPhone = emp.employee.phone.replace(/[^\d]/g, '');
        const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
        const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(reminderMessage)}`;
        setTimeout(() => {
          window.open(url, '_blank');
        }, index * 500); // Stagger by 500ms to avoid browser popup blocking
        sentCount++;
      }
    });

    toast({
      title: 'תזכורות נשלחו',
      description: `נשלחו תזכורות ל${sentCount} עובדים דרך WhatsApp`,
    });
  };

  const unsubmittedCount = submissions?.filter((s: ShiftSubmission) => !s.submitted_at).length || 0;

  return (
    <div className="mb-6 flex gap-4">
      <Button
        onClick={sendReminderToAll}
        variant="outline"
        className="flex items-center gap-2"
        disabled={unsubmittedCount === 0}
      >
        <Send className="h-4 w-4" />
        שלח תזכורת לכולם
        {unsubmittedCount > 0 && (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs mr-2">
            {unsubmittedCount}
          </span>
        )}
      </Button>
      
      {unsubmittedCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          {unsubmittedCount} עובדים לא הגישו משמרות
        </div>
      )}
    </div>
  );
};
