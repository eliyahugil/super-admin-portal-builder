
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { he } from 'date-fns/locale';

interface WeekSelectorProps {
  selectedWeek: Date;
  onWeekChange: (weekStart: Date) => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  selectedWeek,
  onWeekChange
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 }); // Sunday = 0
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });

  const navigateWeek = (direction: 'prev' | 'next' | 'current') => {
    let newWeek: Date;
    switch (direction) {
      case 'prev':
        newWeek = subWeeks(selectedWeek, 1);
        break;
      case 'next':
        newWeek = addWeeks(selectedWeek, 1);
        break;
      case 'current':
        newWeek = new Date();
        break;
      default:
        return;
    }
    onWeekChange(newWeek);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onWeekChange(date);
      setIsCalendarOpen(false);
    }
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    return weekStart.getTime() === currentWeekStart.getTime();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-center">בחירת שבוע</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            שבוע קודם
          </Button>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(weekStart, 'dd/MM', { locale: he })} - {format(weekEnd, 'dd/MM/yyyy', { locale: he })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedWeek}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3"
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('next')}
            className="flex items-center gap-1"
          >
            שבוע הבא
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            variant={isCurrentWeek() ? "default" : "outline"}
            size="sm"
            onClick={() => navigateWeek('current')}
            disabled={isCurrentWeek()}
          >
            השבוע הנוכחי
          </Button>
        </div>

        <div className="mt-3 text-center text-sm text-gray-600">
          שבוע {format(weekStart, 'dd/MM', { locale: he })} - {format(weekEnd, 'dd/MM/yyyy', { locale: he })}
        </div>
      </CardContent>
    </Card>
  );
};
