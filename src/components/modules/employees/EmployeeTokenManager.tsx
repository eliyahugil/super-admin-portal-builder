
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Clock, RefreshCw, Send } from 'lucide-react';
import { sendWhatsappReminder, checkWhatsAppAPIAvailability } from '@/utils/sendWhatsappReminder';

interface EmployeeTokenManagerProps {
  employeeId: string;
  employeeName: string;
  phone: string | null;
  onTokenSent?: () => void;
}

export const EmployeeTokenManager: React.FC<EmployeeTokenManagerProps> = ({
  employeeId,
  employeeName,
  phone,
  onTokenSent
}) => {
  const [loading, setLoading] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
  const [hasWhatsAppAPI, setHasWhatsAppAPI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveToken();
    checkAPIAvailability();
  }, [employeeId]);

  const checkAPIAvailability = async () => {
    const apiAvailable = await checkWhatsAppAPIAvailability();
    setHasWhatsAppAPI(apiAvailable);
  };

  const fetchActiveToken = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_weekly_tokens')
        .select('token, expires_at')
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setActiveToken(data.token);
        setTokenExpiry(data.expires_at);
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  const generateNewToken = async () => {
    try {
      setLoading(true);
      
      // First, deactivate any existing tokens
      await supabase
        .from('employee_weekly_tokens')
        .update({ is_active: false })
        .eq('employee_id', employeeId);

      // Calculate next week dates
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      const weekEnd = new Date(nextWeek);
      weekEnd.setDate(nextWeek.getDate() + 6);
      
      const expiresAt = new Date(weekEnd);
      expiresAt.setDate(expiresAt.getDate() + 7); // Token expires week after submission week

      // Generate new token
      const newToken = crypto.randomUUID().replace(/-/g, '');
      
      const { data, error } = await supabase
        .from('employee_weekly_tokens')
        .insert({
          employee_id: employeeId,
          token: newToken,
          week_start_date: nextWeek.toISOString().split('T')[0],
          week_end_date: weekEnd.toISOString().split('T')[0],
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select('token, expires_at')
        .single();

      if (error) throw error;

      setActiveToken(data.token);
      setTokenExpiry(data.expires_at);
      
      toast({
        title: 'טוקן נוצר בהצלחה',
        description: `טוקן חדש נוצר עבור ${employeeName}`,
      });
      
      return data.token;
    } catch (error) {
      console.error('Error generating token:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור טוקן חדש',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppMessage = async (useExistingToken = true) => {
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
      
      let tokenToSend = activeToken;
      
      if (!useExistingToken || !activeToken) {
        tokenToSend = await generateNewToken();
      }

      if (!tokenToSend) {
        throw new Error('לא ניתן ליצור טוקן');
      }

      // Format phone number for WhatsApp
      const cleanPhone = phone.replace(/[^\d]/g, '');
      const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
      
      // Create submission URL
      const submissionUrl = `${window.location.origin}/weekly-shift-submission/${tokenToSend}`;
      
      // Create WhatsApp message
      const message = 
        `שלום ${employeeName}! 👋\n\n` +
        `זהו הקישור להגשת המשמרות שלך לשבוע הבא:\n` +
        `${submissionUrl}\n\n` +
        `⏰ אנא הגש את המשמרות עד יום רביעי\n` +
        `💼 מערכת ניהול העובדים`;

      // Use the new utility function
      await sendWhatsappReminder(whatsappPhone, message, hasWhatsAppAPI);
      
      const methodText = hasWhatsAppAPI ? 'WhatsApp API' : 'דפדפן';
      toast({
        title: hasWhatsAppAPI ? 'הודעה נשלחה' : 'נפתח WhatsApp',
        description: `${hasWhatsAppAPI ? 'הודעה נשלחה בהצלחה' : 'WhatsApp נפתח עם הודעה מוכנה'} ל-${employeeName} דרך ${methodText}`,
      });

      onTokenSent?.();
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח הודעה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isTokenExpired = tokenExpiry ? new Date(tokenExpiry) < new Date() : false;

  return (
    <div className="flex items-center gap-2">
      {activeToken && !isTokenExpired ? (
        <>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Clock className="h-3 w-3" />
            <span>טוקן פעיל</span>
            {hasWhatsAppAPI && (
              <span className="text-blue-600 text-xs">(API)</span>
            )}
          </div>
          <Button
            onClick={() => sendWhatsAppMessage(true)}
            disabled={loading || !phone}
            variant="outline"
            size="sm"
            className="h-8 text-green-600 border-green-200 hover:bg-green-50"
            title={hasWhatsAppAPI ? 'שלח דרך WhatsApp API' : 'פתח WhatsApp בדפדפן'}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {loading ? 'שולח...' : 'שלח'}
          </Button>
        </>
      ) : (
        <Button
          onClick={() => sendWhatsAppMessage(false)}
          disabled={loading || !phone}
          variant="outline"
          size="sm"
          className="h-8"
          title={hasWhatsAppAPI ? 'צור ושלח טוקן דרך API' : 'צור ושלח טוקן בדפדפן'}
        >
          <Send className="h-3 w-3 mr-1" />
          {loading ? 'יוצר...' : 'צור ושלח טוקן'}
        </Button>
      )}
      
      {activeToken && (
        <Button
          onClick={() => sendWhatsAppMessage(false)}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="צור טוקן חדש"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
