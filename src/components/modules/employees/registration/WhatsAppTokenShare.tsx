import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { EmployeeRegistrationToken } from '@/hooks/useEmployeeRegistrationTokens';

interface Props {
  token: EmployeeRegistrationToken;
  getPublicTokenUrl: (token: string) => string;
}

export const WhatsAppTokenShare: React.FC<Props> = ({ token, getPublicTokenUrl }) => {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const generateWhatsAppMessage = (phone: string) => {
    const tokenUrl = getPublicTokenUrl(token.token);
    const expirationText = token.expires_at 
      ? `תוקף עד: ${format(new Date(token.expires_at), 'dd/MM/yyyy HH:mm', { locale: he })}`
      : 'ללא הגבלת זמן';
    
    const defaultMessage = `שלום! 
    
הינך מוזמן/ת להצטרף לצוות שלנו!

🔗 קישור הרישום: ${tokenUrl}

📝 פרטי הטוקן:
• כותרת: ${token.title}
${token.description ? `• תיאור: ${token.description}` : ''}
• ${expirationText}
${token.max_registrations ? `• מגבלת הרשמות: ${token.current_registrations}/${token.max_registrations}` : ''}

אנא מלא את הטופס בקישור למעלה כדי להשלים את תהליך ההצטרפות.

בהצלחה! 🎉`;

    setMessage(defaultMessage);
    return defaultMessage;
  };

  const openWhatsApp = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'שגיאה',
        description: 'אנא הזן מספר טלפון',
        variant: 'destructive',
      });
      return;
    }

    // תקן את מספר הטלפון (הסר רווחים ומקפים, הוסף 972 אם נדרש)
    let cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '972' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('972')) {
      cleanPhone = '972' + cleanPhone;
    }

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: 'הצלחה',
      description: 'חלון הווטסאפ נפתח',
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          שתף בווטסאפ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            שיתוף טוקן בווטסאפ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* מידע על הטוקן */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="font-semibold">{token.title}</div>
            {token.description && (
              <div className="text-sm text-muted-foreground mt-1">{token.description}</div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {token.expires_at 
                ? `תוקף עד: ${format(new Date(token.expires_at), 'dd/MM/yyyy HH:mm', { locale: he })}`
                : 'ללא הגבלת זמן'
              }
            </div>
          </div>

          {/* מספר טלפון */}
          <div className="space-y-2">
            <Label htmlFor="phone">מספר טלפון העובד *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="050-1234567 או 972501234567"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (e.target.value.trim()) {
                  generateWhatsAppMessage(e.target.value);
                }
              }}
            />
            <div className="text-xs text-muted-foreground">
              ניתן להזין מספר עם או בלי קידומת +972
            </div>
          </div>

          {/* הודעה */}
          <div className="space-y-2">
            <Label htmlFor="message">הודעת הווטסאפ</Label>
            <Textarea
              id="message"
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ההודעה תיווצר אוטומטית כאשר תזין מספר טלפון"
            />
            <div className="text-xs text-muted-foreground">
              ניתן לערוך את ההודעה לפני השליחה
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              ביטול
            </Button>
            <Button 
              onClick={openWhatsApp}
              disabled={!phoneNumber.trim() || !message.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              פתח ווטסאפ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};