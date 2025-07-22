import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEmployeeRegistrationTokens } from '@/hooks/useEmployeeRegistrationTokens';
import { useToast } from '@/hooks/use-toast';
import { Send, Copy, Check, ExternalLink } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface Props {
  employee: Employee;
}

export const SendRegistrationTokenButton: React.FC<Props> = ({ employee }) => {
  const { tokens, getPublicTokenUrl } = useEmployeeRegistrationTokens();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const activeTokens = tokens.filter(token => token.is_active);

  const copyTokenUrl = async (tokenValue: string) => {
    const url = getPublicTokenUrl(tokenValue);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(tokenValue);
      toast({
        title: 'הועתק לזיכרון',
        description: 'קישור הרישום הועתק ללוח הגזירים',
      });
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעתיק את הקישור',
        variant: 'destructive',
      });
    }
  };

  const openInNewTab = (tokenValue: string) => {
    const url = getPublicTokenUrl(tokenValue);
    window.open(url, '_blank');
  };

  if (activeTokens.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Send className="h-4 w-4 mr-2" />
          שלח קישור רישום
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            שליחת קישור רישום לעובד
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="font-semibold text-lg">
              {employee.first_name} {employee.last_name}
            </div>
            <div className="text-sm text-muted-foreground">
              {employee.email} • {employee.id_number}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">בחר טוקן רישום פעיל:</h4>
            
            {activeTokens.map((token) => (
              <div key={token.id} className="border rounded-lg p-4 space-y-3">
                <div>
                  <div className="font-medium">{token.title}</div>
                  {token.description && (
                    <div className="text-sm text-muted-foreground">{token.description}</div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {token.max_registrations && (
                    <div>מגבלה: {token.current_registrations}/{token.max_registrations} רישומים</div>
                  )}
                  {token.expires_at && (
                    <div>תוקף עד: {new Date(token.expires_at).toLocaleDateString('he-IL')}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTokenUrl(token.token)}
                    className="flex-1"
                  >
                    {copiedToken === token.token ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        הועתק
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        העתק קישור
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInNewTab(token.token)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-700 font-medium text-sm">
              💡 כיצד לשלוח את הקישור:
            </div>
            <ul className="mt-2 text-sm text-blue-600 space-y-1">
              <li>• העתק את הקישור והדבק אותו בהודעת WhatsApp/SMS/דוא"ל</li>
              <li>• העובד יכול למלא את הטופס ולשלוח בקשת רישום</li>
              <li>• הבקשה תופיע ברשימת בקשות הרישום לאישור</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};