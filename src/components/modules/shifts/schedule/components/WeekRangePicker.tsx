
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WeekRangePickerProps {
  onWeekChange: (startDate: string, endDate: string) => void;
  initialDate?: Date;
}

export const WeekRangePicker: React.FC<WeekRangePickerProps> = ({
  onWeekChange,
  initialDate = new Date()
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate week range from selected date
  const getWeekRange = (date: Date) => {
    const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate start of week (Sunday)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0],
      startDate: startOfWeek,
      endDate: endOfWeek
    };
  };

  const currentWeek = getWeekRange(selectedDate);

  // Generate array of week days for display
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeek.startDate);
      day.setDate(currentWeek.startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  // Update parent when week changes
  useEffect(() => {
    const week = getWeekRange(selectedDate);
    onWeekChange(week.start, week.end);
  }, [selectedDate, onWeekChange]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
          שבוע קודם
        </Button>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(currentWeek.startDate, 'dd/MM', { locale: he })} - {format(currentWeek.endDate, 'dd/MM/yyyy', { locale: he })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          שבוע הבא
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days Display */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 text-center">ימי השבוע הנבחרים</h4>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div
                  key={index}
                  className={cn(
                    "text-center p-2 rounded-lg border",
                    isToday && "bg-blue-100 border-blue-300",
                    day.getDay() === 6 && "bg-purple-50" // Shabbat
                  )}
                >
                  <div className="text-xs text-gray-600">{dayNames[day.getDay()]}</div>
                  <div className="font-medium">{format(day, 'dd/MM')}</div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-3 text-sm text-gray-600 text-center">
            תקופה: {format(currentWeek.startDate, 'dd/MM/yyyy', { locale: he })} - {format(currentWeek.endDate, 'dd/MM/yyyy', { locale: he })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
