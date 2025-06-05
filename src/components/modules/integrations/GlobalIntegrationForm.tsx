
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GlobalIntegrationFormProps {
  integration: {
    id: string;
    integration_name: string;
    display_name: string;
    global_config?: Record<string, any>;
  };
  onSave?: (config: Record<string, any>) => void;
  onUpdate?: () => void;
}

export const GlobalIntegrationForm: React.FC<GlobalIntegrationFormProps> = ({
  integration,
  onSave,
  onUpdate,
}) => {
  const [config, setConfig] = useState<Record<string, any>>(
    integration.global_config || {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      console.log('Saving global config for integration:', integration.id, config);
      
      const { error } = await supabase
        .from('global_integrations')
        .update({ config })
        .eq('integration_name', integration.integration_name);

      if (error) {
        console.error('Error saving global config:', error);
        throw error;
      }

      toast({
        title: 'הצלחה',
        description: `הגדרות ${integration.display_name} נשמרו בהצלחה`,
      });

      if (onSave) {
        onSave(config);
      }
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את ההגדרות',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (integration.integration_name) {
      case 'google_maps':
      case 'maps':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="api_key">Google Maps API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={config.api_key || ''}
                onChange={(e) => handleChange('api_key', e.target.value)}
                placeholder="AIzaSy..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="region">אזור ברירת מחדל</Label>
              <Input
                id="region"
                value={config.region || 'IL'}
                onChange={(e) => handleChange('region', e.target.value)}
                placeholder="IL"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="access_token">WhatsApp Access Token</Label>
              <Input
                id="access_token"
                type="password"
                value={config.access_token || ''}
                onChange={(e) => handleChange('access_token', e.target.value)}
                placeholder="EAA..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone_number_id">Phone Number ID</Label>
              <Input
                id="phone_number_id"
                value={config.phone_number_id || ''}
                onChange={(e) => handleChange('phone_number_id', e.target.value)}
                placeholder="123456789"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'openai':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="api_key">OpenAI API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={config.api_key || ''}
                onChange={(e) => handleChange('api_key', e.target.value)}
                placeholder="sk-..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="model">מודל ברירת מחדל</Label>
              <Input
                id="model"
                value={config.model || 'gpt-3.5-turbo'}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="gpt-3.5-turbo"
                className="mt-1"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={config.api_key || ''}
                onChange={(e) => handleChange('api_key', e.target.value)}
                placeholder="הכנס API Key..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endpoint">Endpoint URL (אופציונלי)</Label>
              <Input
                id="endpoint"
                value={config.endpoint || ''}
                onChange={(e) => handleChange('endpoint', e.target.value)}
                placeholder="https://api.example.com"
                className="mt-1"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">
          הגדרות גלובליות - {integration.display_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderFormFields()}
        
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'שומר...' : 'שמור הגדרות'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setConfig(integration.global_config || {})}
            disabled={isLoading}
          >
            איפוס
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
