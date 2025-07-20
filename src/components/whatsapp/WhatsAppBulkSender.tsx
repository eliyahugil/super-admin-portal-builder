import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Send, Users, Clock } from 'lucide-react';

interface Props {
  businessId: string;
}

export const WhatsAppBulkSender: React.FC<Props> = ({ businessId }) => {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch employees for bulk sending
  const { data: employees } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, phone')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .not('phone', 'is', null);

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Fetch customers for bulk sending
  const { data: customers } = useQuery({
    queryKey: ['customers', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .not('phone', 'is', null);

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const sendBulkMessages = async () => {
    if (!message.trim() || !category) {
      toast.error('אנא מלא את כל השדות הנדרשים');
      return;
    }

    setIsLoading(true);
    try {
      let recipients: { phone: string; name: string }[] = [];

      if (category === 'employees') {
        recipients = employees?.map(emp => ({
          phone: emp.phone,
          name: `${emp.first_name} ${emp.last_name}`
        })) || [];
      } else if (category === 'customers') {
        recipients = customers?.map(customer => ({
          phone: customer.phone,
          name: customer.name
        })) || [];
      }

      if (recipients.length === 0) {
        toast.error('לא נמצאו נמענים עם מספרי טלפון');
        return;
      }

      // Send messages to all recipients
      const results = await Promise.allSettled(
        recipients.map(async (recipient) => {
          const response = await supabase.functions.invoke('whatsapp-manager', {
            body: {
              action: 'send_message',
              business_id: businessId,
              phone_number: recipient.phone,
              message: message
            }
          });

          if (response.error) {
            throw new Error(`Failed to send to ${recipient.name}: ${response.error.message}`);
          }

          return { recipient: recipient.name, success: true };
        })
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`נשלחו ${successful} הודעות בהצלחה`);
      }
      if (failed > 0) {
        toast.error(`${failed} הודעות נכשלו`);
      }

      setMessage('');
      setCategory('');
    } catch (error) {
      console.error('Bulk send error:', error);
      toast.error('שגיאה בשליחת הודעות');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          שליחה מרוכזת
        </CardTitle>
        <CardDescription>
          שלח הודעה לכל העובדים או הלקוחות בבת אחת
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">קבוצת נמענים</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="בחר קבוצת נמענים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employees">
                עובדים ({employees?.length || 0})
              </SelectItem>
              <SelectItem value="customers">
                לקוחות ({customers?.length || 0})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">תוכן ההודעה</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="כתוב את ההודעה שתישלח לכל הנמענים..."
            rows={4}
          />
        </div>

        {category && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {category === 'employees' ? 'עובדים' : 'לקוחות'}: {
                category === 'employees' ? employees?.length || 0 : customers?.length || 0
              } נמענים
            </Badge>
          </div>
        )}

        <Button 
          onClick={sendBulkMessages} 
          disabled={!message.trim() || !category || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              שולח הודעות...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              שלח לכל הנמענים
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};