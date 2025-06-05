
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Shield, 
  Layers, 
  Plug,
  ChevronRight,
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useModuleConfig } from '@/hooks/useModuleConfig';
import { useBusiness } from '@/hooks/useBusiness';
import type { ModuleCategory } from './ModuleConfigTypes';

const categoryIcons: Record<ModuleCategory, React.ComponentType<{ className?: string }>> = {
  core: Layers,
  integration: Plug,
  management: Settings,
  admin: Shield,
  general: Settings,
};

const categoryNames: Record<ModuleCategory, string> = {
  core: 'מודולי ליבה',
  integration: 'אינטגרציות',
  management: 'ניהול',
  admin: 'מנהל מערכת',
  general: 'כלליים',
};

const categoryColors: Record<ModuleCategory, string> = {
  core: 'bg-blue-100 text-blue-800',
  integration: 'bg-purple-100 text-purple-800',
  management: 'bg-green-100 text-green-800',
  admin: 'bg-red-100 text-red-800',
  general: 'bg-gray-100 text-gray-800',
};

export const ModuleConfigDashboard: React.FC = () => {
  const { isSuperAdmin } = useBusiness();
  const {
    moduleConfigs,
    businessModuleConfigs,
    isLoading,
    getEnabledModules,
    getModulesByCategory,
    toggleModuleForBusiness,
    generateModuleRoute,
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

  const enabledModules = getEnabledModules();
  const categories = [...new Set(moduleConfigs?.map(m => m.category) || [])] as ModuleCategory[];

  // Check if business module is enabled
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

  const handleToggleModule = async (moduleKey: string, currentEnabled: boolean) => {
    await toggleModuleForBusiness(moduleKey, !currentEnabled);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">מודולים זמינים</h1>
        <p className="text-gray-600 mt-2">
          נהל את המודולים הזמינים עבור העסק שלך
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Layers className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {enabledModules.length}
                </p>
                <p className="text-gray-600">מודולים פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plug className="h-8 w-8 text-purple-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {getModulesByCategory('integration').length}
                </p>
                <p className="text-gray-600">אינטגרציות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {getModulesByCategory('core').length}
                </p>
                <p className="text-gray-600">מודולי ליבה</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules by Category */}
      {categories.map(category => {
        const categoryModules = getModulesByCategory(category);
        const allCategoryModules = moduleConfigs?.filter(m => m.category === category) || [];
        
        if (allCategoryModules.length === 0) return null;

        const CategoryIcon = categoryIcons[category];
        
        return (
          <Card key={category} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CategoryIcon className="h-6 w-6" />
                  <div>
                    <CardTitle>{categoryNames[category]}</CardTitle>
                    <CardDescription>
                      {categoryModules.length} מתוך {allCategoryModules.length} מודולים פעילים
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={categoryColors[category]}>
                  {category}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="divide-y">
                {allCategoryModules.map(module => {
                  const isEnabled = isModuleEnabled(module.module_key);
                  const route = generateModuleRoute(module);
                  
                  return (
                    <div key={module.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
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
                              {module.requires_integration && (
                                <Badge variant="outline" className="text-xs">
                                  דורש אינטגרציה
                                </Badge>
                              )}
                              {module.is_core_module && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  מודול ליבה
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {module.minimum_role}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isEnabled && (
                            <Link to={route}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                פתח
                              </Button>
                            </Link>
                          )}
                          
                          {!isSuperAdmin && module.enabled_by_superadmin && (
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => handleToggleModule(module.module_key, isEnabled)}
                              disabled={!module.enabled_by_superadmin}
                            />
                          )}
                          
                          {isSuperAdmin && (
                            <Badge variant="outline" className="text-xs">
                              מנהל מערכת
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
