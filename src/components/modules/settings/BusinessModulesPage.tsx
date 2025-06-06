
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Layers } from 'lucide-react';
import { useModuleConfig } from '@/hooks/useModuleConfig';
import { useBusiness } from '@/hooks/useBusiness';

const BusinessModulesPage: React.FC = () => {
  const { businessId } = useBusiness();
  const {
    moduleConfigs,
    businessModuleConfigs,
    isLoading,
    toggleModuleForBusiness,
  } = useModuleConfig();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען מודולים...</p>
        </div>
      </div>
    );
  }

  // Get available modules that can be enabled by business
  const availableModules = moduleConfigs?.filter(module => 
    module.enabled_by_superadmin && !module.is_core_module
  ) || [];

  // Check if module is enabled for this business
  const isModuleEnabled = (moduleKey: string) => {
    const businessConfig = businessModuleConfigs?.find(
      config => config.module_key === moduleKey
    );
    
    if (!businessConfig) {
      const moduleConfig = moduleConfigs?.find(m => m.module_key === moduleKey);
      return moduleConfig?.default_visible || false;
    }
    
    return businessConfig.is_enabled;
  };

  const handleToggleModule = async (moduleKey: string, enabled: boolean) => {
    await toggleModuleForBusiness(moduleKey, enabled);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'bg-blue-100 text-blue-800',
      integration: 'bg-purple-100 text-purple-800',
      management: 'bg-green-100 text-green-800',
      admin: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול מודולים לעסק</h1>
        <p className="text-gray-600">בחר אילו מודולים יהיו פעילים עבור העסק שלך</p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            סיכום מודולים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {availableModules.filter(m => isModuleEnabled(m.module_key)).length}
              </p>
              <p className="text-gray-600">מודולים פעילים</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {availableModules.length}
              </p>
              <p className="text-gray-600">סך הכל זמינים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            רשימת מודולים זמינים
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableModules.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">אין מודולים זמינים כרגע</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableModules.map((module) => {
                const enabled = isModuleEnabled(module.module_key);
                
                return (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl">{module.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {module.module_name}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {module.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={getCategoryColor(module.category)}>
                            {module.category}
                          </Badge>
                          {module.requires_integration && (
                            <Badge variant="outline" className="text-xs">
                              דורש אינטגרציה
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {module.minimum_role}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          handleToggleModule(module.module_key, checked)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessModulesPage;
