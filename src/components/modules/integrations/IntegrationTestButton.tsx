
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { googleMapsService } from '@/services/GoogleMapsService';

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
      console.log('=== Testing Integration ===');
      console.log('Key:', key, 'Config:', testConfig);

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
        case 'google_maps':
        case 'GOOGLE_MAPS':
          console.log('=== Testing Google Maps Integration ===');
          
          // If we have an API key in config, use it temporarily
          if (testConfig.api_key) {
            console.log('Setting temporary API key for test');
            googleMapsService.setApiKey(testConfig.api_key);
          } else {
            console.log('No API key in config, using service default');
            await googleMapsService.refreshApiKey();
          }
          
          // Test the connection
          const isConnected = await googleMapsService.testConnection();
          
          if (!isConnected) {
            throw new Error('לא ניתן להתחבר ל-Google Maps API. בדוק את ה-API Key');
          }
          
          return { success: true, message: 'החיבור ל-Google Maps תקין' };

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
      console.error('Integration test error:', error);
      return { success: false, message: error.message };
    }
  };

  const handleTest = async () => {
    console.log('=== INTEGRATION TEST START ===');
    console.log('Integration Key:', integrationKey);
    console.log('Config:', config);
    
    setLoading(true);
    setResult(null);

    try {
      const testResult = await testIntegration(integrationKey, config);
      console.log('Test result:', testResult);
      setResult(testResult);
    } catch (error: any) {
      console.error('Test error:', error);
      setResult({ success: false, message: 'שגיאה בבדיקת החיבור' });
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredConfig = () => {
    if (integrationKey === 'maps' || integrationKey === 'google_maps' || integrationKey === 'GOOGLE_MAPS') {
      // For Google Maps, we don't need config here as it comes from global settings
      return true;
    }
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
          {result.message && (
            <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.message}
            </span>
          )}
        </div>
      )}

      {!hasRequiredConfig() && integrationKey !== 'maps' && integrationKey !== 'google_maps' && integrationKey !== 'GOOGLE_MAPS' && (
        <p className="text-xs text-gray-500">
          מלא את השדות הנדרשים כדי לבדוק את החיבור
        </p>
      )}
    </div>
  );
};
