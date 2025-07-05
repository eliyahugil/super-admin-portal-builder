
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar } from 'lucide-react';

interface BulkShiftCreatorDateSelectionProps {
  useWeekdayRange: boolean;
  setUseWeekdayRange: (use: boolean) => void;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  selectedDates: string[];
  addDate: () => void;
  removeDate: (date: string) => void;
  dateRange: {
    start: string;
    end: string;
    selectedWeekdays: number[];
  };
  setDateRange: React.Dispatch<React.SetStateAction<{
    start: string;
    end: string;
    selectedWeekdays: number[];
  }>>;
  toggleWeekday: (weekday: number) => void;
}

const weekdays = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
  { value: 6, label: 'שבת' }
];

export const BulkShiftCreatorDateSelection: React.FC<BulkShiftCreatorDateSelectionProps> = ({
  useWeekdayRange,
  setUseWeekdayRange,
  currentDate,
  setCurrentDate,
  selectedDates,
  addDate,
  removeDate,
  dateRange,
  setDateRange,
  toggleWeekday
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-lg font-semibold">בחירת תאריכים</Label>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="use-range"
          checked={useWeekdayRange}
          onCheckedChange={(checked) => setUseWeekdayRange(checked === true)}
        />
        <Label htmlFor="use-range">השתמש בטווח תאריכים עם ימי שבוע</Label>
      </div>

      {!useWeekdayRange ? (
        <>
          <div className="flex gap-2">
            <Input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addDate} disabled={!currentDate}>
              <Plus className="h-4 w-4 mr-2" />
              הוסף
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedDates.map(date => (
              <Badge key={date} variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(date).toLocaleDateString('he-IL')}
                <button
                  onClick={() => removeDate(date)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>תאריך התחלה</Label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>תאריך סיום</Label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>ימי השבוע</Label>
            <div className="flex flex-wrap gap-2">
              {weekdays.map(weekday => (
                <div key={weekday.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`weekday-${weekday.value}`}
                    checked={dateRange.selectedWeekdays.includes(weekday.value)}
                    onCheckedChange={(checked) => checked === true && toggleWeekday(weekday.value)}
                  />
                  <Label htmlFor={`weekday-${weekday.value}`}>
                    {weekday.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
