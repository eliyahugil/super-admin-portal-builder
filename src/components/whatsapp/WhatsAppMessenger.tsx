import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Users, User, Building, Calendar } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';

interface Props {
  businessId: string;
}

type MessageCategory = 'custom' | 'employees' | 'customers' | 'partners' | 'events';

export const WhatsAppMessenger: React.FC<Props> = ({ businessId }) => {
  const [category, setCategory] = useState<MessageCategory>('custom');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const { isConnected, sendMessage } = useWhatsApp(businessId);

  const handleSend = async () => {
    if (!phoneNumber.trim() || !message.trim()) return;
    
    setSending(true);
    try {
      await sendMessage(phoneNumber, message);
      setMessage('');
      if (category === 'custom') {
        setPhoneNumber('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getCategoryIcon = (cat: MessageCategory) => {
    switch (cat) {
      case 'employees': return <Users className="h-4 w-4" />;
      case 'customers': return <User className="h-4 w-4" />;
      case 'partners': return <Building className="h-4 w-4" />;
      case 'events': return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (cat: MessageCategory) => {
    switch (cat) {
      case 'employees': return 'עובדים';
      case 'customers': return 'לקוחות';
      case 'partners': return 'שותפים';
      case 'events': return 'אירועים';
      default: return 'הודעה מותאמת';
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>יש להתחבר ל-WhatsApp כדי לשלוח הודעות</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          שליחת הודעות WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="category">קטגוריית ההודעה</Label>
          <Select value={category} onValueChange={(value: MessageCategory) => setCategory(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('custom')}
                  {getCategoryLabel('custom')}
                </div>
              </SelectItem>
              <SelectItem value="employees">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('employees')}
                  {getCategoryLabel('employees')}
                </div>
              </SelectItem>
              <SelectItem value="customers">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('customers')}
                  {getCategoryLabel('customers')}
                </div>
              </SelectItem>
              <SelectItem value="partners">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('partners')}
                  {getCategoryLabel('partners')}
                </div>
              </SelectItem>
              <SelectItem value="events">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('events')}
                  {getCategoryLabel('events')}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="phone">מספר טלפון (כולל קידומת מדינה)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="972501234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="message">תוכן ההודעה</Label>
          <Textarea
            id="message"
            placeholder="כתוב את ההודעה שלך כאן..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1"
          />
        </div>

        <Button 
          onClick={handleSend}
          disabled={!phoneNumber.trim() || !message.trim() || sending}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'שולח...' : 'שלח הודעה'}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>💡 טיפ: וודא שמספר הטלפון כולל קידומת מדינה (למשל: 972 לישראל)</p>
        </div>
      </CardContent>
    </Card>
  );
};