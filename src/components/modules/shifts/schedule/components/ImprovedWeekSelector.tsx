
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Home } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, isThisWeek, isSameWeek } from 'date-fns';
import { he } from 'date-fns/locale';

interface ImprovedWeekSelectorProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
  shiftsCount?: number;
}

export const ImprovedWeekSelector: React.FC<ImprovedWeekSelectorProps> = ({
  selectedWeek,
  onWeekChange,
  shiftsCount = 0
}) => {
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });
  const currentWeek = new Date();
  const isCurrentWeek = isThisWeek(selectedWeek);
  const isCurrentWeekSelected = isSameWeek(selectedWeek, currentWeek);

  const handlePrevWeek = () => {
    onWeekChange(subWeeks(selectedWeek, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(selectedWeek, 1));
  };

  const handleCurrentWeek = () => {
    onWeekChange(new Date());
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const formatWeekRange = (start: Date, end: Date) => {
    return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
  };

  // Quick navigation buttons for common week selections
  const quickNavigation = [
    { label: 'השבוע', weeks: 0, key: 'current' },
    { label: 'השבוע הבא', weeks: 1, key: 'next' },
    { label: 'בעוד שבועיים', weeks: 2, key: 'next2' }
  ];

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Main week navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevWeek}
                className="flex items-center gap-1"
              >
                <ChevronRight className="h-4 w-4" />
                שבוע קודם
              </Button>
              
              <Button
                variant={isCurrentWeekSelected ? "default" : "outline"}
                size="sm"
                onClick={handleCurrentWeek}
                className="flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                השבוע הנוכחי
                {isCurrentWeekSelected && <Badge variant="secondary" className="ml-1">נוכחי</Badge>}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                className="flex items-center gap-1"
              >
                שבוע הבא
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Week info */}
            <div className="text-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="text-lg font-semibold">
                  {formatWeekRange(weekStart, weekEnd)}
                </div>
                {isCurrentWeek && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    השבוע הנוכחי
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                שבוע {getWeekNumber(selectedWeek)} • {shiftsCount} משמרות
              </div>
            </div>
          </div>

          {/* Quick navigation */}
          <div className="flex items-center gap-2 justify-center">
            <span className="text-sm text-gray-600 mr-2">מעבר מהיר:</span>
            {quickNavigation.map(({ label, weeks, key }) => {
              const targetWeek = addWeeks(currentWeek, weeks);
              const isSelected = isSameWeek(selectedWeek, targetWeek);
              
              return (
                <Button
                  key={key}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onWeekChange(targetWeek)}
                  className="text-xs"
                >
                  {label}
                  {isSelected && <Badge variant="secondary" className="ml-1 text-xs">נבחר</Badge>}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
