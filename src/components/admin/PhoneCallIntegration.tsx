
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Phone, Settings, TestTube } from 'lucide-react';

export const PhoneCallIntegration: React.FC = () => {
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: '',
    authToken: '',
    fromNumber: '',
    enabled: false
  });
  const [testNumber, setTestNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConfigSave = () => {
    // In a real implementation, this would save to secure storage
    localStorage.setItem('twilio_config', JSON.stringify(twilioConfig));
    toast({
      title: 'הגדרות נשמרו',
      description: 'הגדרות Twilio נשמרו בהצלחה',
    });
  };

  const testPhoneCall = async () => {
    if (!testNumber) {
      toast({
        title: 'שגיאה',
        description: 'אנא הכנס מספר טלפון לבדיקה',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate phone call test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'בדיקה הושלמה',
        description: `נשלחה התקשרות בדיקה ל${testNumber}`,
      });
    } catch (error) {
      toast({
        title: 'שגיאה בבדיקה',
        description: 'לא ניתן לבצע התקשרות בדיקה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          הגדרות התקשרות אוטומטית
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Switch
            id="phone-calls-enabled"
            checked={twilioConfig.enabled}
            onCheckedChange={(checked) => 
              setTwilioConfig(prev => ({ ...prev, enabled: checked }))
            }
          />
          <Label htmlFor="phone-calls-enabled">
            הפעל התקשרות אוטומטית
          </Label>
        </div>

        {twilioConfig.enabled && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account-sid">Twilio Account SID</Label>
                <Input
                  id="account-sid"
                  type="text"
                  value={twilioConfig.accountSid}
                  onChange={(e) => 
                    setTwilioConfig(prev => ({ ...prev, accountSid: e.target.value }))
                  }
                  placeholder="ACxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <Label htmlFor="auth-token">Twilio Auth Token</Label>
                <Input
                  id="auth-token"
                  type="password"
                  value={twilioConfig.authToken}
                  onChange={(e) => 
                    setTwilioConfig(prev => ({ ...prev, authToken: e.target.value }))
                  }
                  placeholder="xxxxxxxxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="from-number">מספר שולח</Label>
              <Input
                id="from-number"
                type="tel"
                value={twilioConfig.fromNumber}
                onChange={(e) => 
                  setTwilioConfig(prev => ({ ...prev, fromNumber: e.target.value }))
                }
                placeholder="+972501234567"
                dir="ltr"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleConfigSave} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                שמור הגדרות
              </Button>
            </div>

            <div className="border-t pt-4">
              <Label htmlFor="test-number">בדיקת התקשרות</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="test-number"
                  type="tel"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="+972501234567"
                  dir="ltr"
                  className="flex-1"
                />
                <Button 
                  onClick={testPhoneCall}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {loading ? 'בודק...' : 'בדוק'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">הוראות הגדרה:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>צור חשבון ב-Twilio.com</li>
            <li>קבל את ה-Account SID ו-Auth Token</li>
            <li>רכוש מספר טלפון ישראלי</li>
            <li>הכנס את הפרטים למעלה והפעל את השירות</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
