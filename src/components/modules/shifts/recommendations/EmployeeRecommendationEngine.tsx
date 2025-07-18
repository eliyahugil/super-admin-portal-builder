import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, TrendingUp } from 'lucide-react';
import { ShiftRecommendations } from './ShiftRecommendations';
import { useEmployeeRecommendations } from '@/hooks/useEmployeeRecommendations';
import { useAuth } from '@/components/auth/AuthContext';

interface EmployeeRecommendationEngineProps {
  shiftId: string;
  shiftTime: string;
  shiftDate: string;
  weekStartDate: string;
  onEmployeeSelected?: (employeeId: string, shiftId: string) => void;
  children?: React.ReactNode;
}

export const EmployeeRecommendationEngine: React.FC<EmployeeRecommendationEngineProps> = ({
  shiftId,
  shiftTime,
  shiftDate,
  weekStartDate,
  onEmployeeSelected,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();
  
  const { data: recommendations, isLoading, error } = useEmployeeRecommendations(
    profile?.business_id || '', 
    weekStartDate
  );

  const currentShiftRecommendations = recommendations?.find(r => r.shiftId === shiftId);
  const topRecommendation = currentShiftRecommendations?.recommendations[0];

  const handleEmployeeSelect = (employeeId: string) => {
    onEmployeeSelected?.(employeeId, shiftId);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <Badge variant="outline" className="text-xs">
        <Lightbulb className="h-3 w-3 mr-1" />
        מחשב...
      </Badge>
    );
  }

  if (error || !currentShiftRecommendations) {
    return null;
  }

  const triggerElement = children || (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <Lightbulb className="h-4 w-4" />
      המלצות עובדים
      {topRecommendation && (
        <Badge className="bg-green-100 text-green-800 text-xs">
          {topRecommendation.matchScore}%
        </Badge>
      )}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5" />
            המלצות עובדים חכמות
            <Badge variant="outline" className="text-sm">
              {shiftTime} | {shiftDate}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">סיכום המלצות</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentShiftRecommendations.recommendations.length}
                </div>
                <div className="text-blue-700">עובדים זמינים</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentShiftRecommendations.recommendations.filter(r => r.isHighPriority).length}
                </div>
                <div className="text-green-700">מומלצים מאוד</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {topRecommendation?.matchScore || 0}%
                </div>
                <div className="text-purple-700">התאמה מרבית</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <ShiftRecommendations
            shiftTime={shiftTime}
            date={shiftDate}
            recommendations={currentShiftRecommendations.recommendations}
            onSelectEmployee={handleEmployeeSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};