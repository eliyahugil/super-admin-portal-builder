
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Sparkles } from 'lucide-react';
import { generateTableName, generateRoute, generateIcon } from '@/utils/moduleUtils';

interface ModuleBasicInfoProps {
  moduleName: string;
  moduleDescription: string;
  moduleIcon: string;
  onModuleNameChange: (name: string) => void;
  onModuleDescriptionChange: (description: string) => void;
  onModuleIconChange: (icon: string) => void;
}

export const ModuleBasicInfo: React.FC<ModuleBasicInfoProps> = ({
  moduleName,
  moduleDescription,
  moduleIcon,
  onModuleNameChange,
  onModuleDescriptionChange,
  onModuleIconChange
}) => {
  // Auto-generate icon when module name changes
  const handleModuleNameChange = (name: string) => {
    onModuleNameChange(name);
    if (name.trim()) {
      const autoIcon = generateIcon(name);
      onModuleIconChange(autoIcon);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטי המודל</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="moduleName">שם המודל</Label>
          <Input
            id="moduleName"
            value={moduleName}
            onChange={(e) => handleModuleNameChange(e.target.value)}
            placeholder="לדוגמה: ניהול פרויקטים, מעקב משימות, רישום לקוחות"
          />
          {moduleName && (
            <div className="mt-2 text-xs space-y-1">
              <div className="text-gray-500">
                <span className="font-medium">שם טבלה:</span> {generateTableName(moduleName, 'temp-id', 0)}
              </div>
              <div className="text-gray-500">
                <span className="font-medium">נתיב:</span> /custom/{generateRoute(moduleName)}
              </div>
              <div className="text-blue-600 font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                המודל יקבל מספר לקוח ייחודי אוטומטית
              </div>
              <div className="text-green-600 font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                דף ייעודי יווצר אוטומטית למודל זה עם ממשק ניהול מלא
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="moduleDescription">תיאור המודל</Label>
          <Textarea
            id="moduleDescription"
            value={moduleDescription}
            onChange={(e) => onModuleDescriptionChange(e.target.value)}
            placeholder="תיאור קצר של המודל ותפקידו"
          />
        </div>

        <div>
          <Label htmlFor="moduleIcon" className="flex items-center gap-2">
            אייקון המודל (נבחר אוטומטית)
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onModuleIconChange(generateIcon(moduleName))}
              className="h-6 w-6 p-0"
              title="רענן אייקון"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="moduleIcon"
              value={moduleIcon}
              onChange={(e) => onModuleIconChange(e.target.value)}
              placeholder="📋"
              className="w-20"
            />
            <div className="text-xs text-gray-500">
              האייקון נבחר אוטומטית על בסיס שם המודל
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
