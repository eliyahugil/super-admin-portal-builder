
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, EyeOff } from 'lucide-react';
import { integrationFieldMap } from '@/config/integrationFieldMap';
import { IntegrationTestButton } from './IntegrationTestButton';

interface DynamicIntegrationFormProps {
  integrationKey: string;
  initialData?: Record<string, any>;
  onSave: (updatedFields: Record<string, any>) => void;
  isLoading?: boolean;
}

export const DynamicIntegrationForm: React.FC<DynamicIntegrationFormProps> = ({
  integrationKey,
  initialData = {},
  onSave,
  isLoading = false,
}) => {
  const config = integrationFieldMap[integrationKey];
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

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
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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

        {/* Integration Test Section */}
        <IntegrationTestButton
          integrationKey={integrationKey}
          config={formData}
        />
      </CardContent>
    </Card>
  );
};
