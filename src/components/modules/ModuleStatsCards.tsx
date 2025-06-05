
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, CheckCircle, XCircle, Building2, Wrench } from 'lucide-react';

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

interface ModuleStatsCardsProps {
  modules: Module[];
}

export const ModuleStatsCards: React.FC<ModuleStatsCardsProps> = ({ modules }) => {
  const customModules = modules.filter(m => m.is_custom);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">סך הכל מודלים</p>
              <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">מודלים פעילים</p>
              <p className="text-2xl font-bold text-green-600">
                {modules.filter(m => m.is_active).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">מודלים לא פעילים</p>
              <p className="text-2xl font-bold text-red-600">
                {modules.filter(m => !m.is_active).length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">מודלים עם נתיב</p>
              <p className="text-2xl font-bold text-purple-600">
                {modules.filter(m => m.route).length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">מודלים מותאמים</p>
              <p className="text-2xl font-bold text-orange-600">
                {customModules.length}
              </p>
            </div>
            <Wrench className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
