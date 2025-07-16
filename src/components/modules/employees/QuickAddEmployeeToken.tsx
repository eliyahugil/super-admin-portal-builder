import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Copy, CheckCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface QuickAddEmployeeTokenProps {
  businessId: string;
  onEmployeeAdded?: () => void;
}

export const QuickAddEmployeeToken: React.FC<QuickAddEmployeeTokenProps> = ({
  businessId,
  onEmployeeAdded
}) => {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateToken = async () => {
    setGeneratingToken(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'שגיאה',
          description: 'עליך להיות מחובר למערכת',
          variant: 'destructive',
        });
        setGeneratingToken(false);
        return;
      }

      // Generate unique token
      const tokenValue = `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Set 24 hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Note: We'll save to localStorage for now since table is not in types yet
      const tokenData = {
        token: tokenValue,
        business_id: businessId,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        is_used: false
      };
      
      // Store in localStorage temporarily
      localStorage.setItem(`quick_add_token_${tokenValue}`, JSON.stringify(tokenData));

      setToken(tokenValue);
      toast({
        title: 'הצלחה',
        description: 'טוקן נוצר בהצלחה! הטוקן בתוקף ל-24 שעות',
      });
    } catch (error) {
      console.error('Error in generateToken:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת הטוקן',
        variant: 'destructive',
      });
    } finally {
      setGeneratingToken(false);
    }
  };

  const copyToClipboard = async () => {
    if (!token) return;
    
    const quickAddUrl = `${window.location.origin}/quick-add-employee?token=${token}`;
    
    try {
      await navigator.clipboard.writeText(quickAddUrl);
      setCopied(true);
      toast({
        title: 'הועתק!',
        description: 'הקישור הועתק ללוח',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'שגיאה',
        description: 'נכשלה העתקה ללוח',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          הוספה מהירה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת קישור להוספת עובד מהירה</DialogTitle>
          <DialogDescription>
            צור קישור שיאפשר להוסיף עובד במהירות עם פרטים בסיסיים
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!token ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">צור קישור הוספה מהירה</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      הקישור יהיה בתוקף ל-24 שעות ויאפשר הוספת עובד אחד בלבד
                    </p>
                  </div>
                  <Button 
                    onClick={generateToken} 
                    disabled={generatingToken}
                    className="w-full"
                  >
                    {generatingToken ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        יוצר קישור...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        צור קישור
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">קישור הוספה מהירה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <Input
                    value={`${window.location.origin}/quick-add-employee?token=${token}`}
                    readOnly
                    className="bg-background"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={copyToClipboard}
                    className="flex-1"
                    variant={copied ? "default" : "outline"}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        הועתק!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        העתק קישור
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setToken('');
                      setCopied(false);
                    }}
                    variant="outline"
                  >
                    צור חדש
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground p-3 bg-amber-50 rounded-md border border-amber-200">
                  <p className="font-medium text-amber-800">הערות חשובות:</p>
                  <ul className="mt-1 space-y-1 text-amber-700">
                    <li>• הקישור בתוקף ל-24 שעות בלבד</li>
                    <li>• ניתן להשתמש בו להוספת עובד אחד בלבד</li>
                    <li>• העובד ייווסף עם פרטים בסיסיים ויהיה צורך לעדכן פרטים נוספים</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};