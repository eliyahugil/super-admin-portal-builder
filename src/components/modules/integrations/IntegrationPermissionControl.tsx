
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Lock } from 'lucide-react';

interface IntegrationPermissionControlProps {
  integrationName: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canTest: boolean;
    canDelete: boolean;
    restrictedRoles: string[];
  };
  onPermissionChange: (permissions: any) => void;
}

const availableRoles = [
  { value: 'business_admin', label: 'מנהל עסק' },
  { value: 'business_user', label: 'משתמש עסק' },
  { value: 'integration_manager', label: 'מנהל אינטגרציות' },
];

export const IntegrationPermissionControl: React.FC<IntegrationPermissionControlProps> = ({
  integrationName,
  permissions,
  onPermissionChange,
}) => {
  const handlePermissionToggle = (permission: keyof typeof permissions, value: boolean) => {
    onPermissionChange({
      ...permissions,
      [permission]: value,
    });
  };

  const handleRoleRestriction = (roles: string[]) => {
    onPermissionChange({
      ...permissions,
      restrictedRoles: roles,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          הרשאות גישה - {integrationName}
        </CardTitle>
        <CardDescription>
          קבע הרשאות מפורטות עבור האינטגרציה
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Permissions */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" />
            הרשאות בסיסיות
          </Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="can-view" className="text-sm font-medium">
                  צפייה
                </Label>
                <p className="text-xs text-gray-500">הצגת הגדרות האינטגרציה</p>
              </div>
              <Switch
                id="can-view"
                checked={permissions.canView}
                onCheckedChange={(checked) => handlePermissionToggle('canView', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="can-edit" className="text-sm font-medium">
                  עריכה
                </Label>
                <p className="text-xs text-gray-500">שינוי הגדרות האינטגרציה</p>
              </div>
              <Switch
                id="can-edit"
                checked={permissions.canEdit}
                onCheckedChange={(checked) => handlePermissionToggle('canEdit', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="can-test" className="text-sm font-medium">
                  בדיקה
                </Label>
                <p className="text-xs text-gray-500">הרצת בדיקות חיבור</p>
              </div>
              <Switch
                id="can-test"
                checked={permissions.canTest}
                onCheckedChange={(checked) => handlePermissionToggle('canTest', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="can-delete" className="text-sm font-medium">
                  מחיקה
                </Label>
                <p className="text-xs text-gray-500">הסרת האינטגרציה</p>
              </div>
              <Switch
                id="can-delete"
                checked={permissions.canDelete}
                onCheckedChange={(checked) => handlePermissionToggle('canDelete', checked)}
              />
            </div>
          </div>
        </div>

        {/* Role Restrictions */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            הגבלות לפי תפקיד
          </Label>
          
          <div className="space-y-2">
            <Label htmlFor="restricted-roles" className="text-sm">
              תפקידים עם גישה מוגבלת
            </Label>
            <Select
              value={permissions.restrictedRoles.join(',')}
              onValueChange={(value) => handleRoleRestriction(value ? value.split(',') : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקידים להגבלה" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {permissions.restrictedRoles.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {permissions.restrictedRoles.map((role) => {
                  const roleLabel = availableRoles.find(r => r.value === role)?.label || role;
                  return (
                    <Badge key={role} variant="outline">
                      {roleLabel}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Permission Summary */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium mb-2 block">סיכום הרשאות</Label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>צפייה:</span>
              <Badge variant={permissions.canView ? 'default' : 'secondary'}>
                {permissions.canView ? 'מותר' : 'אסור'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>עריכה:</span>
              <Badge variant={permissions.canEdit ? 'default' : 'secondary'}>
                {permissions.canEdit ? 'מותר' : 'אסור'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>בדיקה:</span>
              <Badge variant={permissions.canTest ? 'default' : 'secondary'}>
                {permissions.canTest ? 'מותר' : 'אסור'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>מחיקה:</span>
              <Badge variant={permissions.canDelete ? 'destructive' : 'secondary'}>
                {permissions.canDelete ? 'מותר' : 'אסור'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
