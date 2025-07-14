import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Wifi
} from 'lucide-react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { WhatsAppConnection } from './WhatsAppConnection';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const WhatsAppDashboard: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const {
    connection,
    contacts,
    sendMessage,
    createLeadFromContact,
    isConnected
  } = useWhatsAppIntegration();

  const [selectedContact, setSelectedContact] = useState<string>('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('אנא הכניסו תוכן הודעה');
      return;
    }

    // Determine phone number to send to
    let phoneNumber = '';
    let contactId = '';

    if (selectedContact) {
      const contact = contacts.find(c => c.id === selectedContact);
      if (contact) {
        phoneNumber = contact.phone_number;
        contactId = contact.id;
      }
    } else if (newPhoneNumber.trim()) {
      phoneNumber = newPhoneNumber.trim();
    } else {
      toast.error('אנא בחרו איש קשר או הכניסו מספר טלפון');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        contactId: contactId || undefined,
        phoneNumber,
        content: messageContent
      });
      
      toast.success('ההודעה נשלחה בהצלחה!');
      setMessageContent('');
      setNewPhoneNumber('');
    } catch (error) {
      toast.error('שגיאה בשליחת ההודעה: ' + (error as Error).message);
    }
  };

  const handleCreateLead = async (contactId: string) => {
    try {
      await createLeadFromContact.mutateAsync(contactId);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Business</h1>
          <p className="text-muted-foreground mt-1">
            נהלו את התקשורת עם הלקוחות שלכם ב-WhatsApp דרך Twilio
          </p>
        </div>
        
        {isConnected ? (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
            <Wifi className="h-4 w-4 mr-2" />
            מחובר ל-Twilio
          </Badge>
        ) : (
          <Badge variant="destructive" className="px-3 py-1">
            <AlertCircle className="h-4 w-4 mr-2" />
            לא מחובר
          </Badge>
        )}
      </div>

      {/* Connection Status Card */}
      {connection && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">חיבור פעיל</h3>
                  <p className="text-sm text-green-700">
                    מספר: {connection.phone_number}
                  </p>
                  <p className="text-xs text-green-600">
                    {connection.device_name}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                פעיל
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Connection & Send Message */}
        <div className="xl:col-span-1 space-y-6">
          {/* Connection Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5" />
                ניהול חיבור
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <WhatsAppConnection />
            </CardContent>
          </Card>

          {/* Send Message Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="h-5 w-5" />
                שליחת הודעה
              </CardTitle>
              <CardDescription>
                שלחו הודעות ללקוחות דרך Twilio WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">נדרש חיבור</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    חברו ל-WhatsApp כדי לשלוח הודעות
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">איש קשר קיים</label>
                  <select 
                    value={selectedContact} 
                    onChange={(e) => {
                      setSelectedContact(e.target.value);
                      if (e.target.value) setNewPhoneNumber('');
                    }}
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground text-sm"
                    disabled={!isConnected}
                  >
                    <option value="">-- בחרו איש קשר --</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name || contact.phone_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center text-xs text-muted-foreground">או</div>

                <div>
                  <label className="text-sm font-medium text-foreground">מספר טלפון חדש</label>
                  <Input
                    value={newPhoneNumber}
                    onChange={(e) => {
                      setNewPhoneNumber(e.target.value);
                      if (e.target.value) setSelectedContact('');
                    }}
                    placeholder="+972501234567"
                    disabled={!isConnected}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">תוכן ההודעה</label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="הכניסו את תוכן ההודעה כאן..."
                    rows={3}
                    disabled={!isConnected}
                    className="mt-1 text-sm"
                  />
                </div>

                <Button 
                  onClick={handleSendMessage}
                  disabled={!isConnected || sendMessage.isPending || !messageContent.trim()}
                  className="w-full"
                  size="sm"
                >
                  {sendMessage.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      שלח הודעה
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contacts & Messages */}
        <div className="xl:col-span-2 space-y-6">
          {/* Contacts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                אנשי קשר ({contacts.length})
              </CardTitle>
              <CardDescription>
                רשימת כל אנשי הקשר ב-WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">אין אנשי קשר</h3>
                  <p className="text-sm">אנשי קשר יופיעו כאן לאחר שליחת או קבלת הודעות</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.slice(0, 8).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {contact.name || contact.phone_number}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.phone_number}
                          </p>
                          {contact.last_seen && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(contact.last_seen).toLocaleDateString('he-IL')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedContact(contact.id)}
                          disabled={!isConnected}
                        >
                          שלח
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCreateLead(contact.id)}
                          disabled={createLeadFromContact.isPending}
                        >
                          ליד
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Twilio Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">הערות חשובות - Twilio Sandbox</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>• אתם משתמשים ב-Twilio Sandbox למטרות בדיקה</p>
                    <p>• כדי לקבל הודעות, הנמען צריך לשלוח הודעה עם הקוד המיוחד למספר: <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">+1 415 523 8886</code></p>
                    <p>• ההודעה צריכה להיות: <code className="bg-blue-100 px-1 py-0.5 rounded text-xs font-mono">join [קוד-ייחודי]</code></p>
                    <p>• לאחר מכן תוכלו לשלוח ולקבל הודעות דו-כיוונית</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};