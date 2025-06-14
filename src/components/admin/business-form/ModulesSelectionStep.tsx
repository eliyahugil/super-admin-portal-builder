
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Crown, Settings } from 'lucide-react';
import { SubscriptionPlanSelector } from '../SubscriptionPlanSelector';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { availableModules } from './types';

interface ModulesSelectionStepProps {
  selectedModules: string[];
  selectedPlanId: string;
  useSubscriptionPlan: boolean;
  onToggleModule: (moduleKey: string) => void;
  onPlanSelect: (planId: string) => void;
  onToggleSubscriptionPlan: (useSubscriptionPlan: boolean) => void;
}

export const ModulesSelectionStep: React.FC<ModulesSelectionStepProps> = ({
  selectedModules,
  selectedPlanId,
  useSubscriptionPlan,
  onToggleModule,
  onPlanSelect,
  onToggleSubscriptionPlan
}) => {
  return (
    <div className="space-y-6">
      {/* Subscription Plan Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            אופן ניהול הרשאות
          </CardTitle>
          <CardDescription>
            בחר כיצד תרצה לנהל את הרשאות המודולים לעסק זה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="useSubscriptionPlan"
              checked={useSubscriptionPlan}
              onCheckedChange={(checked) => onToggleSubscriptionPlan(checked as boolean)}
            />
            <Label htmlFor="useSubscriptionPlan">
              שימוש בתוכניות מנוי (מומלץ)
            </Label>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {useSubscriptionPlan 
              ? 'תוכניות המנוי מספקות ניהול הרשאות אוטומטי ומתקדם'
              : 'בחירה ידנית של מודולים ללא תוכנית מנוי'
            }
          </p>
        </CardContent>
      </Card>

      {/* Subscription Plan Selection or Manual Module Selection */}
      {useSubscriptionPlan ? (
        <SubscriptionPlanSelector
          selectedPlanId={selectedPlanId}
          onPlanSelect={onPlanSelect}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              מודולים זמינים לעסק
            </CardTitle>
            <CardDescription>בחר את המודולים שיהיו זמינים לעסק זה</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableModules.map((module) => (
                <div
                  key={module.key}
                  className="flex items-start space-x-3 space-x-reverse p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={selectedModules.includes(module.key)}
                    onCheckedChange={() => onToggleModule(module.key)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium cursor-pointer text-sm sm:text-base">
                      {module.label}
                    </Label>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                      {module.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              נבחרו {selectedModules.length} מודולים
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
