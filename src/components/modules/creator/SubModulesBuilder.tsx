
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Folder, FileText } from 'lucide-react';
import { generateRoute } from '@/utils/moduleUtils';
import type { SubModule } from '@/utils/moduleTypes';

interface SubModulesBuilderProps {
  subModules: SubModule[];
  onSubModulesChange: (subModules: SubModule[]) => void;
}

export const SubModulesBuilder: React.FC<SubModulesBuilderProps> = ({
  subModules,
  onSubModulesChange
}) => {
  const addSubModule = () => {
    const newSubModule: SubModule = {
      id: Date.now().toString(),
      name: '',
      description: '',
      route: '',
      icon: '📄',
      display_order: subModules.length + 1
    };
    onSubModulesChange([...subModules, newSubModule]);
  };

  const updateSubModule = (id: string, updates: Partial<SubModule>) => {
    onSubModulesChange(subModules.map(subModule => 
      subModule.id === id ? { ...subModule, ...updates } : subModule
    ));
  };

  const removeSubModule = (id: string) => {
    onSubModulesChange(subModules.filter(subModule => subModule.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            תת-מודלים (אופציונלי)
          </div>
          <Button onClick={addSubModule} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            הוסף תת-מודל
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subModules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ללא תת-מודלים. ניתן להוסיף תת-מודלים לארגון טוב יותר של התוכן.
          </div>
        ) : (
          <div className="space-y-4">
            {subModules.map((subModule, index) => (
              <div key={subModule.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">תת-מודל {index + 1}</span>
                  </div>
                  <Button
                    onClick={() => removeSubModule(subModule.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>שם תת-המודל</Label>
                    <Input
                      value={subModule.name}
                      onChange={(e) => updateSubModule(subModule.id, { 
                        name: e.target.value,
                        route: generateRoute(e.target.value)
                      })}
                      placeholder="לדוגמה: ניהול קבצים, דוחות"
                    />
                  </div>

                  <div>
                    <Label>נתיב תת-המודל</Label>
                    <Input
                      value={subModule.route}
                      onChange={(e) => updateSubModule(subModule.id, { route: e.target.value })}
                      placeholder="לדוגמה: files, reports"
                    />
                  </div>
                </div>

                <div>
                  <Label>תיאור תת-המודל</Label>
                  <Input
                    value={subModule.description || ''}
                    onChange={(e) => updateSubModule(subModule.id, { description: e.target.value })}
                    placeholder="תיאור קצר של תפקיד תת-המודל"
                  />
                </div>

                <div>
                  <Label>אייקון תת-המודל</Label>
                  <Input
                    value={subModule.icon}
                    onChange={(e) => updateSubModule(subModule.id, { icon: e.target.value })}
                    placeholder="📄"
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
