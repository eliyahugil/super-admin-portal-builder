
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Building2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ModuleCardProps {
  module: Module;
  onEdit: (module: Module) => void;
  onManageBusinesses: (module: Module) => void;
  onToggleActive: (moduleId: string, currentStatus: boolean) => void;
  onDelete: (moduleId: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onEdit,
  onManageBusinesses,
  onToggleActive,
  onDelete,
}) => {
  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          {module.icon && (
            <span className="text-2xl">{module.icon}</span>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{module.description || 'אין תיאור'}</p>
          </div>
        </div>
        <Badge 
          variant={module.is_active ? "default" : "secondary"}
          className={module.is_active ? "bg-green-100 text-green-800" : ""}
        >
          {module.is_active ? 'פעיל' : 'לא פעיל'}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {module.route && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium ml-2">נתיב:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {module.route}
            </code>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium ml-2">תאריך יצירה:</span>
          <span>{new Date(module.created_at).toLocaleDateString('he-IL')}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(module)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageBusinesses(module)}
          >
            <Building2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant={module.is_active ? "secondary" : "default"}
            size="sm"
            onClick={() => onToggleActive(module.id, module.is_active)}
          >
            {module.is_active ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(module.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
