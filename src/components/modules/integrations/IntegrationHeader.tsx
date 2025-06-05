
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface IntegrationHeaderProps {
  integration: Integration;
  isActive: boolean;
}

export const IntegrationHeader: React.FC<IntegrationHeaderProps> = ({
  integration,
  isActive,
}) => {
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
  );
};
