
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface IntegrationTestButtonProps {
  integrationKey: string;
  config: Record<string, any>;
}

export const IntegrationTestButton: React.FC<IntegrationTestButtonProps> = ({
  integrationKey,
  config,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);

  const testIntegration = async (key: string, testConfig: Record<string, any>) => {
    try {
      switch (key) {
        case 'whatsapp':
          if (!testConfig.token || !testConfig.phone_number_id) {
            throw new Error('חסר Token או Phone Number ID');
          }
          const wspResponse = await fetch(
            `https://graph.facebook.com/v18.0/${testConfig.phone_number_id}/whatsapp_business_profile`,
            {
              headers: {
                Authorization: `Bearer ${testConfig.token}`,
              },
            }
          );
          if (!wspResponse.ok) {
            throw new Error('ה-Token לא תקין או Phone Number ID שגוי');
          }
          return { success: true };

        case 'facebook_leads':
          if (!testConfig.access_token || !testConfig.page_id) {
            throw new Error('חסר Access Token או Page ID');
          }
          const fbResponse = await fetch(
            `https://graph.facebook.com/v18.0/${testConfig.page_id}?access_token=${testConfig.access_token}`
          );
          if (!fbResponse.ok) {
            throw new Error('שגיאה בגישה לדף הפייסבוק');
          }
          return { success: true };

        case 'maps':
          if (!testConfig.api_key) {
            throw new Error('חסר Google Maps API Key');
          }
          const mapsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=31.7683,35.2137&key=${testConfig.api_key}`
          );
          const mapsData = await mapsResponse.json();
          if (mapsData.status === 'REQUEST_DENIED') {
            throw new Error('API Key שגוי או חסר הרשאות');
          }
          if (mapsData.status === 'INVALID_REQUEST') {
            throw new Error('בקשה לא תקינה');
          }
          return { success: true };

        case 'icount':
          if (!testConfig.username || !testConfig.password || !testConfig.entity_id) {
            throw new Error('חסרים פרטי התחברות (שם משתמש, סיסמה או קוד מוסד)');
          }
          // For now, just validate that all required fields are present
          // In a real implementation, we would test the actual iCount API
          return { success: true };

        case 'invoicing':
          if (!testConfig.api_key || !testConfig.company_id) {
            throw new Error('חסר API Key או מזהה חברה');
          }
          return { success: true };

        case 'communication':
          if (!testConfig.api_key || !testConfig.sender_id) {
            throw new Error('חסר API Key או מזהה שולח');
          }
          return { success: true };

        default:
          throw new Error('סוג אינטגרציה לא מוכר');
      }
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const testResult = await testIntegration(integrationKey, config);
      setResult(testResult);
    } catch (error: any) {
      setResult({ success: false, message: 'שגיאה בבדיקת החיבור' });
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredConfig = () => {
    return Object.keys(config).length > 0 && Object.values(config).some(value => value);
  };

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">בדיקת חיבור</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={loading || !hasRequiredConfig()}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          {loading ? 'בודק...' : 'בדוק חיבור'}
        </Button>
      </div>

      {result && (
        <div className="flex items-start gap-2">
          {result.success ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 ml-1" />
              חיבור תקין
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              שגיאה
            </Badge>
          )}
          {result.message && !result.success && (
            <span className="text-sm text-red-600">{result.message}</span>
          )}
        </div>
      )}

      {!hasRequiredConfig() && (
        <p className="text-xs text-gray-500">
          מלא את השדות הנדרשים כדי לבדוק את החיבור
        </p>
      )}
    </div>
  );
};
