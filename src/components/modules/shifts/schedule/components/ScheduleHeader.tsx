
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ScheduleView } from '../types';

interface ScheduleHeaderProps {
  currentDate: Date;
  view: ScheduleView;
  setView: (view: ScheduleView) => void;
  navigateDate: (direction: -1 | 0 | 1) => void;
  isMobile: boolean;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  currentDate,
  view,
  setView,
  navigateDate,
  isMobile
}) => {
  const hebrewMonthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const formatDateRange = () => {
    if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startMonth = hebrewMonthNames[startOfWeek.getMonth()];
      const endMonth = hebrewMonthNames[endOfWeek.getMonth()];
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${startMonth} ${startOfWeek.getFullYear()}`;
      } else {
        return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} ${endOfWeek.getFullYear()}`;
      }
    } else if (view === 'month') {
      return `${hebrewMonthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      return `${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} text-center`}>
          {formatDateRange()}
        </CardTitle>
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate(-1)}
          >
            <ChevronRight className="h-4 w-4" />
            {view === 'week' ? 'שבוע קודם' : view === 'month' ? 'חודש קודם' : 'שנה קודמת'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate(0)}
            className="px-4"
          >
            היום
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate(1)}
          >
            <ChevronLeft className="h-4 w-4" />
            {view === 'week' ? 'שבוע הבא' : view === 'month' ? 'חודש הבא' : 'שנה הבאה'}
          </Button>
        </div>
      </div>
      
      <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('week')}
        >
          שבוע
        </Button>
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('month')}
        >
          חודש
        </Button>
        <Button
          variant={view === 'year' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('year')}
        >
          שנה
        </Button>
      </div>
    </div>
  );
};
