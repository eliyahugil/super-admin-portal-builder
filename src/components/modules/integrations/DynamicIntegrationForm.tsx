
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, EyeOff, History, Shield } from 'lucide-react';
import { integrationFieldMap } from '@/config/integrationFieldMap';
import { IntegrationTestButton } from './IntegrationTestButton';
import { IntegrationAuditLog } from './IntegrationAuditLog';
import { IntegrationPermissionControl } from './IntegrationPermissionControl';
import { WhatsAppIntegrationForm } from './WhatsAppIntegrationForm';
import { useIntegrationAuditLog } from '@/hooks/useIntegrationAuditLog';

interface DynamicIntegrationFormProps {
  integrationKey: string;
  initialData?: Record<string, any>;
  onSave: (updatedFields: Record<string, any>) => void;
  isLoading?: boolean;
  businessId?: string;
  viewMode?: 'merged' | 'tabs';
}

export const DynamicIntegrationForm: React.FC<DynamicIntegrationFormProps> = ({
  integrationKey,
  initialData = {},
  onSave,
  isLoading = false,
  businessId,
  viewMode = 'merged',
}) => {
  const config = integrationFieldMap[integrationKey];
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [permissions, setPermissions] = useState({
    canView: true,
    canEdit: true,
    canTest: true,
    canDelete: false,
    restrictedRoles: [],
  });

  const { logAction } = useIntegrationAuditLog(businessId);

  // Special handling for WhatsApp
  if (integrationKey === 'whatsapp') {
    return (
      <WhatsAppIntegrationForm
        businessId={businessId}
        viewMode={viewMode}
        onSave={onSave}
      />
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            סוג אינטגרציה לא מזוהה: {integrationKey}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleChange = (key: string, value: string) => {
    const oldValue = formData[key];
    setFormData((prev) => ({ ...prev, [key]: value }));
    
    // Log the change if businessId is available
    if (businessId && oldValue !== value) {
      logAction({
        integrationName: integrationKey,
        action: 'edit',
        changes: {
          field: key,
          oldValue: oldValue || '',
          newValue: value,
        },
      });
    }
  };

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    
    // Log the save action
    if (businessId) {
      logAction({
        integrationName: integrationKey,
        action: Object.keys(initialData).length > 0 ? 'edit' : 'create',
        changes: {
          updatedFields: Object.keys(formData),
          formData,
        },
      });
    }
  };

  const renderMainForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`field-${field.key}`} className="text-sm font-medium">
            {field.label}
            {field.type === 'password' && (
              <span className="text-red-500 mr-1">*</span>
            )}
          </Label>
          <div className="relative">
            <Input
              id={`field-${field.key}`}
              type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full"
            />
            {field.type === 'password' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => togglePasswordVisibility(field.key)}
              >
                {showPasswords[field.key] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'שומר...' : 'שמור הגדרות'}
        </Button>
      </div>
    </form>
  );

  if (viewMode === 'tabs') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{config.label}</CardTitle>
              <CardDescription>
                הגדר את פרטי החיבור עבור האינטגרציה
              </CardDescription>
            </div>
            <Badge variant="outline">
              {config.fields.length} שדות
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="settings">הגדרות</TabsTrigger>
              <TabsTrigger value="test">בדיקת חיבור</TabsTrigger>
              <TabsTrigger value="permissions">הרשאות</TabsTrigger>
              <TabsTrigger value="audit">יומן פעילות</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4">
              {renderMainForm()}
            </TabsContent>
            
            <TabsContent value="test">
              <IntegrationTestButton
                integrationKey={integrationKey}
                config={formData}
              />
            </TabsContent>
            
            <TabsContent value="permissions">
              {businessId && (
                <IntegrationPermissionControl
                  integrationName={integrationKey}
                  permissions={permissions}
                  onPermissionChange={setPermissions}
                />
              )}
            </TabsContent>
            
            <TabsContent value="audit">
              {businessId && (
                <IntegrationAuditLog
                  businessId={businessId}
                  integrationName={integrationKey}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Merged view
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{config.label}</CardTitle>
              <CardDescription>
                הגדר את פרטי החיבור עבור האינטגרציה
              </CardDescription>
            </div>
            <Badge variant="outline">
              {config.fields.length} שדות
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {renderMainForm()}
          
          {/* Integration Test Section */}
          <div className="mt-6">
            <IntegrationTestButton
              integrationKey={integrationKey}
              config={formData}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Cards for Merged View */}
      {businessId && (
        <>
          <IntegrationPermissionControl
            integrationName={integrationKey}
            permissions={permissions}
            onPermissionChange={setPermissions}
          />
          
          <IntegrationAuditLog
            businessId={businessId}
            integrationName={integrationKey}
          />
        </>
      )}
    </div>
  );
};
