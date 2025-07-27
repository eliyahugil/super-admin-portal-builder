
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Home } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, isThisWeek, isSameWeek } from 'date-fns';

interface MobileWeekSelectorProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
  shiftsCount?: number;
}

export const MobileWeekSelector: React.FC<MobileWeekSelectorProps> = ({
  selectedWeek,
  onWeekChange,
  shiftsCount = 0
}) => {
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });
  const currentWeek = new Date();
  const isCurrentWeek = isThisWeek(selectedWeek);

  const handlePrevWeek = () => {
    onWeekChange(subWeeks(selectedWeek, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(selectedWeek, 1));
  };

  const handleCurrentWeek = () => {
    onWeekChange(new Date());
  };

  const formatWeekRange = (start: Date, end: Date) => {
    return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevWeek}
              className="flex items-center gap-1 flex-1"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="text-xs">שבוע קודם</span>
            </Button>
            
            <Button
              variant={isCurrentWeek ? "default" : "outline"}
              size="sm"
              onClick={handleCurrentWeek}
              className="mx-2 flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              <span className="text-xs">נוכחי</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="flex items-center gap-1 flex-1"
            >
              <span className="text-xs">שבוע הבא</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Week info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div className="text-sm font-semibold">
                {formatWeekRange(weekStart, weekEnd)}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <span>{shiftsCount} משמרות</span>
              {isCurrentWeek && (
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  השבוע הנוכחי
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
