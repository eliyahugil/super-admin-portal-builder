import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from '@/types/employee';

interface BulkSendMessageDialogProps {
  employees: Employee[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BulkSendMessageDialog: React.FC<BulkSendMessageDialogProps> = ({
  employees,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'whatsapp' | 'notification'>('notification');
  const [title, setTitle] = useState('');

  const handleSubmit = async () => {
    if (!message.trim() || (messageType === 'notification' && !title.trim())) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות הנדרשים',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (messageType === 'notification') {
        // שליחת התראות למערכת
        const user = await supabase.auth.getUser();
        const notifications = employees.map(employee => ({
          employee_id: employee.id,
          title: title,
          message: message,
          is_read: false,
          sent_by: user.data.user?.id
        }));

        const { error } = await supabase
          .from('employee_notifications')
          .insert(notifications);

        if (error) throw error;

        toast({
          title: 'הצלחה',
          description: `התראה נשלחה ל-${employees.length} עובדים`,
        });
      } else {
        // שליחת הודעות WhatsApp
        const employeesWithPhone = employees.filter(emp => emp.phone);
        
        if (employeesWithPhone.length === 0) {
          toast({
            title: 'אזהרה',
            description: 'אף עובד נבחר אינו מכיל מספר טלפון',
            variant: 'destructive'
          });
          return;
        }

        // שליחה לכל עובד עם טלפון
        for (const employee of employeesWithPhone) {
          const cleanPhone = employee.phone!.replace(/[^\d]/g, '');
          const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
          
          const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          
          // רגע קטן בין פתיחת החלונות
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        toast({
          title: 'הצלחה',
          description: `WhatsApp נפתח עבור ${employeesWithPhone.length} עובדים`,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error sending messages:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בשליחת ההודעות',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const employeesWithPhone = employees.filter(emp => emp.phone).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>שליחת הודעה ל-{employees.length} עובדים</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>סוג הודעה</Label>
            <RadioGroup value={messageType} onValueChange={(value) => setMessageType(value as any)}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="notification" id="notification" />
                <Label htmlFor="notification">התראה במערכת</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp">
                  WhatsApp ({employeesWithPhone} עובדים עם טלפון)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {messageType === 'notification' && (
            <div>
              <Label htmlFor="title">כותרת ההתראה</Label>
              <input
                id="title"
                className="w-full p-2 border rounded-md"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="כותרת ההתראה..."
                dir="rtl"
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">תוכן ההודעה</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כתוב את ההודעה..."
              rows={4}
              dir="rtl"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              עובדים נבחרים: {employees.map(emp => `${emp.first_name} ${emp.last_name}`).join(', ')}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !message.trim() || (messageType === 'notification' && !title.trim())}
            >
              {loading ? 'שולח...' : 'שלח הודעה'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};