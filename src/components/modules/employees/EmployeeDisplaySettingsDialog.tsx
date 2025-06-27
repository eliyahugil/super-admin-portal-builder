
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings, Eye, Users, RotateCcw } from 'lucide-react';
import { useEmployeeDisplaySettings } from '@/hooks/useEmployeeDisplaySettings';
import { useToast } from '@/hooks/use-toast';

interface EmployeeDisplaySettingsDialogProps {
  businessId?: string | null;
  actualStats: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    archivedEmployees: number;
  };
}

export const EmployeeDisplaySettingsDialog: React.FC<EmployeeDisplaySettingsDialogProps> = ({
  businessId,
  actualStats
}) => {
  const { settings, updateDisplayMode, updateCustomCounts, resetToDefaults } = useEmployeeDisplaySettings(businessId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [localCustomCounts, setLocalCustomCounts] = useState(settings.customCounts);

  const handleSave = () => {
    updateCustomCounts(localCustomCounts);
    setOpen(false);
    toast({
      title: 'הגדרות נשמרו',
      description: 'הגדרות התצוגה עודכנו בהצלחה',
    });
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalCustomCounts(DEFAULT_SETTINGS.customCounts);
    toast({
      title: 'הגדרות אופסו',
      description: 'ההגדרות חזרו לברירת המחדל',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          הגדרות תצוגה
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            הגדרות תצוגת כמויות עובדים
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Display Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">אופן התצוגה</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={settings.displayMode} 
                onValueChange={(value) => updateDisplayMode(value as 'actual' | 'custom')}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <RadioGroupItem value="actual" id="actual" />
                  <Label htmlFor="actual" className="cursor-pointer">
                    <div>
                      <div className="font-medium">נתונים אמיתיים</div>
                      <div className="text-sm text-gray-500">
                        הצג את כמויות העובדים הקיימות במערכת
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer">
                    <div>
                      <div className="font-medium">כמויות מותאמות</div>
                      <div className="text-sm text-gray-500">
                        הגדר כמויות מותאמות אישית לתצוגה
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Current Actual Stats */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                נתונים אמיתיים נוכחיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">עובדים קיימים: </span>
                  <span className="text-blue-700">{actualStats.totalEmployees}</span>
                </div>
                <div>
                  <span className="font-medium">עובדים פעילים: </span>
                  <span className="text-green-700">{actualStats.activeEmployees}</span>
                </div>
                <div>
                  <span className="font-medium">עובדים לא פעילים: </span>
                  <span className="text-red-700">{actualStats.inactiveEmployees}</span>
                </div>
                <div>
                  <span className="font-medium">עובדים בארכיון: </span>
                  <span className="text-purple-700">{actualStats.archivedEmployees}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Counts Configuration */}
          {settings.displayMode === 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">כמויות מותאמות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalEmployees">עובדים קיימים</Label>
                    <Input
                      id="totalEmployees"
                      type="number"
                      min="0"
                      value={localCustomCounts.totalEmployees}
                      onChange={(e) => setLocalCustomCounts(prev => ({
                        ...prev,
                        totalEmployees: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="activeEmployees">עובדים פעילים</Label>
                    <Input
                      id="activeEmployees"
                      type="number"
                      min="0"
                      value={localCustomCounts.activeEmployees}
                      onChange={(e) => setLocalCustomCounts(prev => ({
                        ...prev,
                        activeEmployees: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inactiveEmployees">עובדים לא פעילים</Label>
                    <Input
                      id="inactiveEmployees"
                      type="number"
                      min="0"
                      value={localCustomCounts.inactiveEmployees}
                      onChange={(e) => setLocalCustomCounts(prev => ({
                        ...prev,
                        inactiveEmployees: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="archivedEmployees">עובדים בארכיון</Label>
                    <Input
                      id="archivedEmployees"
                      type="number"
                      min="0"
                      value={localCustomCounts.archivedEmployees}
                      onChange={(e) => setLocalCustomCounts(prev => ({
                        ...prev,
                        archivedEmployees: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              איפוס הגדרות
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleSave}>
                שמור הגדרות
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DEFAULT_SETTINGS = {
  displayMode: 'actual' as const,
  customCounts: {
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    archivedEmployees: 0,
  }
};
