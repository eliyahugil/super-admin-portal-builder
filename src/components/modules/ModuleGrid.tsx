
import React from 'react';
import { Settings, Wrench } from 'lucide-react';
import { ModuleCard } from './ModuleCard';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  is_active: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
  module_config?: any;
}

interface ModuleGridProps {
  modules: Module[];
  onEdit: (module: Module) => void;
  onManageBusinesses: (module: Module) => void;
  onToggleActive: (moduleId: string, currentStatus: boolean) => void;
  onDelete: (moduleId: string) => void;
  onViewCustomModule?: (module: Module) => void;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  onEdit,
  onManageBusinesses,
  onToggleActive,
  onDelete,
  onViewCustomModule,
}) => {
  const customModules = modules.filter(m => m.is_custom);
  const systemModules = modules.filter(m => !m.is_custom);

  return (
    <div className="space-y-8">
      {/* Custom Modules Section */}
      {customModules.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            מודלים מותאמים אישית ({customModules.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onEdit={onEdit}
                onManageBusinesses={onManageBusinesses}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
                onViewCustomModule={onViewCustomModule}
              />
            ))}
          </div>
        </div>
      )}

      {/* System Modules Section */}
      {systemModules.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            מודלי מערכת ({systemModules.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onEdit={onEdit}
                onManageBusinesses={onManageBusinesses}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
