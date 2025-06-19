
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { ExternalLink, Key, AlertCircle } from 'lucide-react';

interface GoogleOAuthSetupProps {
  businessId: string;
}

export const GoogleOAuthSetup: React.FC<GoogleOAuthSetupProps> = ({ businessId }) => {
  const { saveOAuthToken, isSaving } = useGoogleCalendar(businessId);
  const [step, setStep] = useState<'instructions' | 'token-input' | 'completed'>('instructions');
  const [tokenData, setTokenData] = useState({
    access_token: '',
    refresh_token: '',
    scope: 'https://www.googleapis.com/auth/calendar'
  });

  const handleSaveToken = () => {
    if (!tokenData.access_token) {
      alert('נדרש Access Token');
      return;
    }

    saveOAuthToken({
      user_id: '', // Will be set by the backend
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
    });
    setStep('completed');
  };

  const redirectToGoogleAuth = () => {
    const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // This should come from env vars
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar');
    const responseType = 'code';
    const accessType = 'offline';
    const prompt = 'consent';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=${responseType}&` +
      `access_type=${accessType}&` +
      `prompt=${prompt}`;

    window.open(authUrl, '_blank');
    setStep('token-input');
  };

  if (step === 'completed') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          אימות Google הושלם בהצלחה! כעת תוכל להוסיף ולסנכרן לוחות שנה.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {step === 'instructions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              הגדרת אימות Google Calendar
            </CardTitle>
            <CardDescription>
              עקוב אחר השלבים הבאים כדי לחבר את Google Calendar שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">צור פרויקט ב-Google Cloud Console</h4>
                  <p className="text-sm text-gray-600">
                    צור פרויקט חדש או השתמש בקיים ב-Google Cloud Console
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Google Cloud Console
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">הפעל את Google Calendar API</h4>
                  <p className="text-sm text-gray-600">
                    עבור ל-APIs & Services ותפעיל את Google Calendar API
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">צור OAuth 2.0 Credentials</h4>
                  <p className="text-sm text-gray-600">
                    ב-Credentials, צור OAuth 2.0 Client ID עבור אפליקציית ווב
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <p><strong>Authorized redirect URIs:</strong></p>
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {window.location.origin}/auth/google/callback
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-medium">קבל אישור מ-Google</h4>
                  <p className="text-sm text-gray-600">
                    לחץ על הכפתור למטה כדי לאשר גישה ל-Google Calendar
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>חשוב:</strong> וודא שהגדרת את הרשאות הגישה הנכונות עבור Google Calendar API
                בפרויקט ב-Google Cloud Console.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button onClick={redirectToGoogleAuth} className="flex-1">
                התחבר ל-Google Calendar
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('token-input')}
              >
                הזן אסימון ידנית
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'token-input' && (
        <Card>
          <CardHeader>
            <CardTitle>הזן פרטי אימות</CardTitle>
            <CardDescription>
              הזן את האסימון שקיבלת מ-Google
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="access_token">Access Token *</Label>
              <Input
                id="access_token"
                type="password"
                value={tokenData.access_token}
                onChange={(e) => setTokenData({ ...tokenData, access_token: e.target.value })}
                placeholder="האסימון שקיבלת מ-Google"
                required
              />
            </div>

            <div>
              <Label htmlFor="refresh_token">Refresh Token (אופציונלי)</Label>
              <Input
                id="refresh_token"
                type="password"
                value={tokenData.refresh_token}
                onChange={(e) => setTokenData({ ...tokenData, refresh_token: e.target.value })}
                placeholder="לחידוש אוטומטי של האסימון"
              />
            </div>

            <div>
              <Label htmlFor="scope">Scope</Label>
              <Input
                id="scope"
                value={tokenData.scope}
                onChange={(e) => setTokenData({ ...tokenData, scope: e.target.value })}
                placeholder="https://www.googleapis.com/auth/calendar"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                האסימונים מאוחסנים בצורה מוצפנת ומאובטחת במסד הנתונים שלנו.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveToken} disabled={isSaving}>
                {isSaving ? 'שומר...' : 'שמור אסימון'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('instructions')}
              >
                חזור
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
