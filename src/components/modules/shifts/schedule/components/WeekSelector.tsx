
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

interface WeekSelectorProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  selectedWeek,
  onWeekChange
}) => {
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });

  const handlePrevWeek = () => {
    onWeekChange(subWeeks(selectedWeek, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(selectedWeek, 1));
  };

  const handleToday = () => {
    onWeekChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-4" dir="rtl">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevWeek}
        >
          <ChevronRight className="h-4 w-4" />
          שבוע קודם
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
        >
          השבוע
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
        >
          שבוע הבא
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-lg font-medium">
        {format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM/yyyy')}
      </div>
    </div>
  );
};
