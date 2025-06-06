
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendWhatsappReminder } from '@/utils/sendWhatsappReminder';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusiness } from '@/hooks/useBusiness';

interface SendReminderButtonProps {
  phone: string;
  employeeName: string;
  tokenUrl: string;
}

export const SendReminderButton: React.FC<SendReminderButtonProps> = ({
  phone,
  employeeName,
  tokenUrl,
}) => {
  const [loading, setLoading] = useState(false);
  const { businessId } = useBusiness();
  const { settings } = useBusinessSettings(businessId);
  const { toast } = useToast();

  const handleClick = async () => {
    if (!phone) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מספר טלפון לעובד זה',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const message = `שלום ${employeeName}! 👋\n\nנא למלא את המשמרות שלך כאן:\n${tokenUrl}\n\n⏰ אנא הגש עד יום רביעי\n💼 מערכת ניהול העובדים`;
      
      const useAPI = settings?.use_whatsapp_api || false;
      
      await sendWhatsappReminder(phone, message, useAPI);
      
      const methodText = useAPI ? 'WhatsApp API' : 'דפדפן';
      toast({
        title: useAPI ? 'הודעה נשלחה' : 'נפתח WhatsApp',
        description: `${useAPI ? 'הודעה נשלחה בהצלחה' : 'WhatsApp נפתח עם הודעה מוכנה'} ל-${employeeName} דרך ${methodText}`,
      });
    } catch (error) {
      console.error('Error sending WhatsApp reminder:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח הודעה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleClick}
      disabled={loading || !phone}
      className="flex items-center gap-2"
      title={settings?.use_whatsapp_api ? 'שלח דרך WhatsApp API' : 'פתח WhatsApp בדפדפן'}
    >
      <MessageCircle className="h-4 w-4" />
      {loading ? 'שולח...' : 'שלח תזכורת'}
      {settings?.use_whatsapp_api && (
        <span className="text-xs text-blue-600">(API)</span>
      )}
    </Button>
  );
};
