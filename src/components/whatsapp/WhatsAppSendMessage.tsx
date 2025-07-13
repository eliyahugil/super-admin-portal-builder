import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, MessageCircle, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusiness } from '@/hooks/useBusiness';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { toast } from 'sonner';

export const WhatsAppSendMessage: React.FC = () => {
  const { businessId } = useBusiness();
  const { connection, isConnected } = useWhatsAppIntegration();
  const queryClient = useQueryClient();

  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [message, setMessage] = useState('');

  const sendMessageMutation = useMutation({
    mutationFn: async ({ phone, message, contactName }: { phone: string; message: string; contactName?: string }) => {
      if (!businessId) throw new Error('Business ID is required');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-native', {
        body: { 
          action: 'send',
          businessId,
          phone,
          message,
          contactName
        }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      toast.success('הודעה נשלחה בהצלחה!');
      // Clear form
      setPhone('');
      setContactName('');
      setMessage('');
    },
    onError: (error) => {
      toast.error('שגיאה בשליחת הודעה: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast.error('נא הזינו מספר טלפון');
      return;
    }
    
    if (!message.trim()) {
      toast.error('נא הזינו הודעה');
      return;
    }
    
    sendMessageMutation.mutate({ 
      phone: phone.trim(), 
      message: message.trim(),
      contactName: contactName.trim() || undefined
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format Israeli phone numbers
    if (digits.startsWith('972')) {
      return digits.slice(0, 12); // +972-XX-XXX-XXXX
    } else if (digits.startsWith('0')) {
      return digits.slice(0, 10); // 0XX-XXX-XXXX
    } else {
      return digits.slice(0, 10);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            שליחת הודעת WhatsApp
          </CardTitle>
          <CardDescription>
            שלחו הודעות WhatsApp ללקוחות שלכם
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              WhatsApp לא מחובר. אנא התחברו תחילה בכרטיסיה "חיבור WhatsApp" כדי לשלוח הודעות.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          שליחת הודעת WhatsApp
        </CardTitle>
        <CardDescription>
          שלחו הודעות WhatsApp ללקוחות שלכם. ההודעות יישלחו דרך החשבון המחובר.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                מספר טלפון *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="050-123-4567 או 972-50-123-4567"
                value={phone}
                onChange={handlePhoneChange}
                required
                dir="ltr"
                className="text-left"
              />
              <p className="text-xs text-muted-foreground">
                ניתן להזין מספר ישראלי (050) או בינלאומי (+972)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                שם איש קשר (אופציונלי)
              </Label>
              <Input
                id="contactName"
                type="text"
                placeholder="שם הלקוח"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                שם זה יישמר בטבלת אנשי הקשר
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              הודעה *
            </Label>
            <Textarea
              id="message"
              placeholder="כתבו כאן את ההודעה שברצונכם לשלוח..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>מקסימום 1000 תווים</span>
              <span>{message.length}/1000</span>
            </div>
          </div>

          {connection && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <MessageCircle className="h-4 w-4" />
                <span>הודעות יישלחו מהמספר: {connection.phone_number}</span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={sendMessageMutation.isPending || !phone.trim() || !message.trim()}
            className="w-full"
          >
            {sendMessageMutation.isPending ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-pulse" />
                שולח הודעה...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                שלח הודעה
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};