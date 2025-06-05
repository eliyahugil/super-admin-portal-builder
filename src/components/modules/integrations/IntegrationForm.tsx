
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Trash2, Save } from 'lucide-react';

interface Integration {
  id: string;
  integration_name: string;
  display_name: string;
  description: string | null;
  category: string;
  icon: string | null;
  requires_global_key: boolean;
  requires_business_credentials: boolean;
  is_active: boolean;
}

interface BusinessIntegration {
  id: string;
  integration_name: string;
  display_name: string;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  credentials: Record<string, any>;
  config: Record<string, any>;
}

interface IntegrationFormProps {
  integration: Integration;
  businessIntegration?: BusinessIntegration;
  onSave: (values: Partial<BusinessIntegration>) => void;
  onDelete?: (integrationId: string) => void;
}

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  integration,
  businessIntegration,
  onSave,
  onDelete,
}) => {
  const [isActive, setIsActive] = useState(businessIntegration?.is_active || false);
  const [apiKey, setApiKey] = useState(businessIntegration?.credentials?.api_key || '');
  const [webhookUrl, setWebhookUrl] = useState(businessIntegration?.credentials?.webhook_url || '');
  const [notes, setNotes] = useState(businessIntegration?.config?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      is_active: isActive,
      credentials: {
        ...businessIntegration?.credentials,
        api_key: apiKey,
        webhook_url: webhookUrl,
      },
      config: {
        ...businessIntegration?.config,
        notes: notes,
      },
    });
  };

  const handleDelete = () => {
    if (businessIntegration && onDelete) {
      if (confirm(`האם אתה בטוח שברצונך למחוק את האינטגרציה "${integration.display_name}"?`)) {
        onDelete(businessIntegration.id);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'maps': 'bg-blue-100 text-blue-800',
      'crm': 'bg-purple-100 text-purple-800',
      'invoicing': 'bg-green-100 text-green-800',
      'communication': 'bg-yellow-100 text-yellow-800',
      'automation': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames: Record<string, string> = {
      'maps': 'מפות וניווט',
      'crm': 'ניהול לקוחות',
      'invoicing': 'חשבוניות',
      'communication': 'תקשורת',
      'automation': 'אוטומציה',
    };
    return displayNames[category] || category;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{integration.icon || '🔗'}</span>
            <div>
              <CardTitle className="text-lg">{integration.display_name}</CardTitle>
              <CardDescription className="mt-1">
                {integration.description}
              </CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className={getCategoryColor(integration.category)}>
                  {getCategoryDisplayName(integration.category)}
                </Badge>
                {integration.requires_global_key && (
                  <Badge variant="secondary" className="text-xs">
                    מפתח גלובלי
                  </Badge>
                )}
                {integration.requires_business_credentials && (
                  <Badge variant="outline" className="text-xs">
                    הגדרות עסק
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'פעיל' : 'לא פעיל'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch 
              checked={isActive} 
              onCheckedChange={setIsActive}
              id={`active-${integration.id}`}
            />
            <Label htmlFor={`active-${integration.id}`}>
              הפעל אינטגרציה זו
            </Label>
          </div>

          {integration.requires_business_credentials && (
            <>
              <div>
                <Label htmlFor={`api-key-${integration.id}`}>
                  מפתח API
                </Label>
                <Input
                  id={`api-key-${integration.id}`}
                  type="password"
                  placeholder="הזן מפתח API..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`webhook-${integration.id}`}>
                  Webhook URL (אופציונלי)
                </Label>
                <Input
                  id={`webhook-${integration.id}`}
                  type="url"
                  placeholder="https://..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor={`notes-${integration.id}`}>
              הערות (אופציונלי)
            </Label>
            <Textarea
              id={`notes-${integration.id}`}
              placeholder="הערות נוספות על האינטגרציה..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                שמור הגדרות
              </Button>
            </div>

            {businessIntegration && onDelete && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {businessIntegration?.last_sync && (
            <div className="text-sm text-gray-500 pt-2 border-t">
              סונכרן לאחרונה: {new Date(businessIntegration.last_sync).toLocaleDateString('he-IL')}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
