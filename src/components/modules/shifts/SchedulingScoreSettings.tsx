import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SchedulingScoreSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ScoreWeights {
  shiftType: number;
  branchAssignment: number;
  dayAvailability: number;
  weeklyHours: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  shiftType: 50,
  branchAssignment: 35,
  dayAvailability: 20,
  weeklyHours: 15
};

export const SchedulingScoreSettings: React.FC<SchedulingScoreSettingsProps> = ({
  open,
  onOpenChange
}) => {
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
  const [hasChanges, setHasChanges] = useState(false);

  const totalScore = weights.shiftType + weights.branchAssignment + weights.dayAvailability + weights.weeklyHours;

  const handleWeightChange = (key: keyof ScoreWeights, value: number[]) => {
    const newWeights = { ...weights, [key]: value[0] };
    setWeights(newWeights);
    setHasChanges(true);
  };

  const handleReset = () => {
    setWeights(DEFAULT_WEIGHTS);
    setHasChanges(true);
    toast.success('הגדרות הוחזרו לברירת מחדל');
  };

  const handleSave = () => {
    // כאן נשמור את ההגדרות - לעתיד ניתן לשמור ב-local storage או בדטאבייס
    console.log('🔧 Saving score weights:', weights);
    localStorage.setItem('schedulingScoreWeights', JSON.stringify(weights));
    setHasChanges(false);
    toast.success('הגדרות הסידור נשמרו בהצלחה');
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const savedWeights = localStorage.getItem('schedulingScoreWeights');
      if (savedWeights) {
        setWeights(JSON.parse(savedWeights));
      } else {
        setWeights(DEFAULT_WEIGHTS);
      }
      setHasChanges(false);
    }
    onOpenChange(false);
  };

  // טעינת הגדרות שמורות בפתיחת הדיאלוג
  React.useEffect(() => {
    if (open) {
      const savedWeights = localStorage.getItem('schedulingScoreWeights');
      if (savedWeights) {
        try {
          const parsed = JSON.parse(savedWeights);
          setWeights(parsed);
        } catch (error) {
          console.error('Error parsing saved weights:', error);
          setWeights(DEFAULT_WEIGHTS);
        }
      }
      setHasChanges(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            הגדרות מהירות - חלוקת אחוזי סידור
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Card */}
          <Card className={`border-2 ${totalScore > 120 ? 'border-red-200 bg-red-50' : totalScore < 100 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>סיכום נקודות</span>
                <Badge 
                  variant={totalScore > 120 ? 'destructive' : totalScore < 100 ? 'secondary' : 'default'}
                  className="text-lg px-3 py-1"
                >
                  {totalScore} נקודות
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                {totalScore > 120 && '⚠️ סה"כ הנקודות גבוה מהמומלץ (מעל 120)'}
                {totalScore < 100 && 'ℹ️ סה"כ הנקודות נמוך (מתחת 100)'}
                {totalScore >= 100 && totalScore <= 120 && '✅ חלוקת נקודות מאוזנת'}
              </div>
            </CardContent>
          </Card>

          {/* Score Settings */}
          <div className="space-y-6">
            {/* Shift Type */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">התאמת סוג משמרת (בוקר/ערב)</Label>
                <Badge variant="outline">{weights.shiftType} נקודות</Badge>
              </div>
              <Slider
                value={[weights.shiftType]}
                onValueChange={(value) => handleWeightChange('shiftType', value)}
                max={80}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-gray-600">
                מעניק נקודות לעובד שמעדיף את סוג המשמרת (בוקר או ערב)
              </p>
            </div>

            {/* Branch Assignment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">שיוך לסניף</Label>
                <Badge variant="outline">{weights.branchAssignment} נקודות</Badge>
              </div>
              <Slider
                value={[weights.branchAssignment]}
                onValueChange={(value) => handleWeightChange('branchAssignment', value)}
                max={60}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-gray-600">
                מעניק נקודות לעובד שמשויך לסניף של המשמרת
              </p>
            </div>

            {/* Day Availability */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">זמינות ביום</Label>
                <Badge variant="outline">{weights.dayAvailability} נקודות</Badge>
              </div>
              <Slider
                value={[weights.dayAvailability]}
                onValueChange={(value) => handleWeightChange('dayAvailability', value)}
                max={40}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-gray-600">
                מעניק נקודות אם העובד זמין ביום המשמרת (לפי ההעדפות שלו)
              </p>
            </div>

            {/* Weekly Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">מאזן שעות שבועיות</Label>
                <Badge variant="outline">{weights.weeklyHours} נקודות</Badge>
              </div>
              <Slider
                value={[weights.weeklyHours]}
                onValueChange={(value) => handleWeightChange('weeklyHours', value)}
                max={30}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-gray-600">
                מעניק נקודות בהתאם למצב השעות השבועיות של העובד (פחות/תקין/יתר)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              שמור הגדרות
            </Button>
            
            <Button 
              onClick={handleReset}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              איפוס
            </Button>
            
            <Button 
              onClick={handleCancel}
              variant="outline"
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};