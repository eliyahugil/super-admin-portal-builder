
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Building2, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Eye,
  Wrench
} from 'lucide-react';

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
}

interface ModuleCardProps {
  module: Module;
  onEdit: (module: Module) => void;
  onManageBusinesses: (module: Module) => void;
  onToggleActive: (moduleId: string, currentStatus: boolean) => void;
  onDelete: (moduleId: string) => void;
  onViewCustomModule?: (module: Module) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onEdit,
  onManageBusinesses,
  onToggleActive,
  onDelete,
  onViewCustomModule
}) => {
  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
      !module.is_active ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {module.icon || (module.is_custom ? '🔧' : '📋')}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">
                {module.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={module.is_active ? 'default' : 'secondary'}>
                  {module.is_active ? 'פעיל' : 'לא פעיל'}
                </Badge>
                {module.is_custom && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Wrench className="h-3 w-3 mr-1" />
                    מותאם אישית
                  </Badge>
                )}
                {module.route && (
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    נתיב: {module.route}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {module.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {module.description}
            </p>
          )}
          
          <div className="text-xs text-gray-500">
            נוצר: {new Date(module.created_at).toLocaleDateString('he-IL')}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {module.is_custom && onViewCustomModule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewCustomModule(module)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                צפה בנתונים
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(module)}
              className="flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" />
              ערוך
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageBusinesses(module)}
              className="flex items-center gap-1"
            >
              <Building2 className="h-3 w-3" />
              עסקים
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(module.id, module.is_active)}
              className="flex items-center gap-1"
            >
              {module.is_active ? (
                <>
                  <ToggleRight className="h-3 w-3" />
                  השבת
                </>
              ) : (
                <>
                  <ToggleLeft className="h-3 w-3" />
                  הפעל
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(module.id)}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="h-3 w-3" />
              מחק
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
