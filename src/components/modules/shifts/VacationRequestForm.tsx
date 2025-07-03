
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, addDays, differenceInDays, isAfter, isBefore } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, FileText, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface VacationRequestFormProps {
  onSubmit: (request: VacationRequest) => void;
  onCancel: () => void;
}

interface VacationRequest {
  startDate: Date;
  endDate: Date;
  reason: string;
  notes?: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'military';
}

export const VacationRequestForm: React.FC<VacationRequestFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<VacationRequest['type']>('vacation');

  const today = new Date();
  const maxDate = addDays(today, 60); // 2 months ahead

  const vacationTypes = [
    { value: 'vacation', label: 'חופשה שנתית', color: 'bg-blue-100 text-blue-800' },
    { value: 'sick', label: 'מחלה', color: 'bg-red-100 text-red-800' },
    { value: 'personal', label: 'עניינים אישיים', color: 'bg-purple-100 text-purple-800' },
    { value: 'maternity', label: 'לידה/אימוץ', color: 'bg-pink-100 text-pink-800' },
    { value: 'military', label: 'מילואים', color: 'bg-green-100 text-green-800' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateRange?.from || !dateRange?.to) {
      alert('אנא בחר תאריכי התחלה וסיום');
      return;
    }

    if (!reason.trim()) {
      alert('אנא הזן סיבה לבקשת החופשה');
      return;
    }

    const request: VacationRequest = {
      startDate: dateRange.from,
      endDate: dateRange.to,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      type
    };

    onSubmit(request);
  };

  const getDayCount = (): number => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from) + 1;
  };

  const formatDateRange = (): string => {
    if (!dateRange?.from || !dateRange?.to) return '';
    
    const start = format(dateRange.from, 'd MMMM yyyy', { locale: he });
    const end = format(dateRange.to, 'd MMMM yyyy', { locale: he });
    
    return `${start} - ${end}`;
  };

  const selectedType = vacationTypes.find(t => t.value === type);

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                הגשת בקשת חופשה
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                ניתן להגיש בקשה עד חודשיים מראש
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vacation Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">סוג הבקשה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vacationTypes.map((vacationType) => (
                <button
                  key={vacationType.value}
                  type="button"
                  onClick={() => setType(vacationType.value as VacationRequest['type'])}
                  className={`p-3 rounded-lg border-2 transition-colors text-right ${
                    type === vacationType.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge className={vacationType.color}>
                      {vacationType.label}
                    </Badge>
                    {type === vacationType.value && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">בחירת תאריכים</CardTitle>
            <p className="text-sm text-gray-600">
              בחר תאריך התחלה וסיום החופשה
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                locale={he}
                disabled={(date) => 
                  isBefore(date, today) || 
                  isAfter(date, maxDate)
                }
                className="rounded-md border"
              />
              
              {dateRange?.from && dateRange?.to && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDateRange()} ({getDayCount()} ימים)
                    </span>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                ניתן לבחור תאריכים עד {format(maxDate, 'd MMMM yyyy', { locale: he })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פרטי הבקשה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reason" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                סיבה לחופשה *
              </Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`לדוגמה: ${selectedType?.label}`}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">הערות נוספות (אופציונלי)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות, פרטים נוספים או בקשות מיוחדות..."
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {dateRange?.from && dateRange?.to && reason && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">סיכום הבקשה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">סוג הבקשה:</span>
                  <Badge className={selectedType?.color}>
                    {selectedType?.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">תאריכים:</span>
                  <span className="font-medium">{formatDateRange()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">מספר ימים:</span>
                  <span className="font-medium">{getDayCount()} ימים</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">סיבה:</span>
                  <span className="font-medium text-left max-w-xs">{reason}</span>
                </div>
                {notes && (
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">הערות:</span>
                    <span className="text-sm text-gray-600 text-left max-w-xs">{notes}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!dateRange?.from || !dateRange?.to || !reason.trim()}
            className="flex-1"
          >
            שלח בקשת חופשה
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            ביטול
          </Button>
        </div>
      </form>
    </div>
  );
};
