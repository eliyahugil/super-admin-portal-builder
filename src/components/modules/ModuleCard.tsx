
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit2, 
  Trash2, 
  Building2, 
  ToggleLeft, 
  ToggleRight,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const isCustomModule = module.is_custom;
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      !module.is_active ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{module.icon || '📋'}</span>
            <div className="flex-1">
              <CardTitle className="text-lg">{module.name}</CardTitle>
              {module.description && (
                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={module.is_active ? 'default' : 'secondary'}>
              {module.is_active ? 'פעיל' : 'לא פעיל'}
            </Badge>
            {isCustomModule && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                מותאם אישית
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Module Route */}
          {module.route && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">נתיב:</span> {module.route}
            </div>
          )}
          
          {/* Creation Date */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">נוצר:</span>{' '}
            {new Date(module.created_at).toLocaleDateString('he-IL')}
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {/* Navigate to Module Page for Custom Modules */}
            {isCustomModule && module.route && (
              <Link to={module.route}>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  פתח דף המודל
                </Button>
              </Link>
            )}
            
            {/* View Custom Module (Popup) */}
            {isCustomModule && onViewCustomModule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewCustomModule(module)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                צפייה מהירה
              </Button>
            )}
            
            {/* Edit Module */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(module)}
              className="flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" />
              עריכה
            </Button>
            
            {/* Manage Businesses */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageBusinesses(module)}
              className="flex items-center gap-1"
            >
              <Building2 className="h-3 w-3" />
              עסקים
            </Button>
            
            {/* Toggle Active */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(module.id, module.is_active)}
              className="flex items-center gap-1"
            >
              {module.is_active ? (
                <ToggleLeft className="h-3 w-3" />
              ) : (
                <ToggleRight className="h-3 w-3" />
              )}
              {module.is_active ? 'השבת' : 'הפעל'}
            </Button>
            
            {/* Delete Module */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(module.id)}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
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
