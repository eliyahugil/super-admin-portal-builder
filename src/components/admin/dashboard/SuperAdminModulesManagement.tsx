
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface SuperAdminModulesManagementProps {
  businesses: any[];
  moduleConfigs: any[];
  businessModules: any[];
  isModuleEnabled: (businessId: string, moduleKey: string) => boolean;
  handleToggleModule: (businessId: string, moduleKey: string) => void;
  toggleModuleMutation: any;
}

export const SuperAdminModulesManagement: React.FC<SuperAdminModulesManagementProps> = ({
  businesses,
  moduleConfigs,
  businessModules,
  isModuleEnabled,
  handleToggleModule,
  toggleModuleMutation,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ניהול מודולים לעסקים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {businesses.map((business) => (
            <div key={business.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{business.name}</h3>
                  <p className="text-sm text-gray-600">{business.contact_email}</p>
                </div>
                <Badge variant={business.is_active ? 'default' : 'secondary'}>
                  {business.is_active ? 'פעיל' : 'לא פעיל'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {moduleConfigs.map((module) => (
                  <div key={module.module_key} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{module.module_name}</p>
                      <p className="text-xs text-gray-500">{module.module_key}</p>
                    </div>
                    <Switch
                      checked={isModuleEnabled(business.id, module.module_key)}
                      onCheckedChange={() => handleToggleModule(business.id, module.module_key)}
                      disabled={toggleModuleMutation.isPending}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
