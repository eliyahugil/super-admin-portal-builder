
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DynamicIntegrationForm } from './DynamicIntegrationForm';
import { IntegrationHeader } from './IntegrationHeader';
import { IntegrationControls } from './IntegrationControls';
import { IntegrationActions } from './IntegrationActions';

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
  isLoading?: boolean;
}

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  integration,
  businessIntegration,
  onSave,
  onDelete,
  isLoading = false,
}) => {
  const [isActive, setIsActive] = useState(businessIntegration?.is_active || false);
  const [notes, setNotes] = useState(businessIntegration?.config?.notes || '');

  const handleConfigSave = (configData: Record<string, any>) => {
    onSave({
      is_active: isActive,
      config: {
        ...configData,
        notes: notes,
      },
      credentials: configData, // For backward compatibility
    });
  };

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <IntegrationHeader 
            integration={integration}
            isActive={isActive}
          />
        </CardHeader>

        <CardContent>
          <IntegrationControls
            integrationId={integration.id}
            isActive={isActive}
            notes={notes}
            onActiveChange={setIsActive}
            onNotesChange={setNotes}
          />

          <IntegrationActions
            businessIntegration={businessIntegration}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Dynamic Configuration Form */}
      {integration.requires_business_credentials && (
        <DynamicIntegrationForm
          integrationKey={integration.integration_name}
          initialData={businessIntegration?.config || {}}
          onSave={handleConfigSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
