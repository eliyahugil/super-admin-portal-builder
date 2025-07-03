
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isAfter, isBefore } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus } from 'lucide-react';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  branch_name: string;
  max_employees: number;
  current_employees: number;
}

interface SelectedShift {
  date: Date;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  branchName: string;
}

interface ShiftSubmissionCalendarProps {
  businessId: string;
  onSubmit: (shifts: SelectedShift[]) => void;
  onVacationRequest: () => void;
}

export const ShiftSubmissionCalendar: React.FC<ShiftSubmissionCalendarProps> = ({
  businessId,
  onSubmit,
  onVacationRequest
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedShifts, setSelectedShifts] = useState<SelectedShift[]>([]);
  const [availableShifts, setAvailableShifts] = useState<ShiftTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate work week boundaries (Sunday to Saturday)
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday = 0
  const maxDate = addDays(currentWeekStart, 20); // 2 weeks + 6 days ahead

  // Mock data for available shifts - in real app, fetch from database
  const mockShifts: ShiftTemplate[] = [
    {
      id: '1',
      name: 'משמרת בוקר',
      start_time: '08:00',
      end_time: '16:00',
      branch_name: 'סניף ראשי',
      max_employees: 5,
      current_employees: 2
    },
    {
      id: '2',
      name: 'משמרת צהריים',
      start_time: '12:00',
      end_time: '20:00',
      branch_name: 'סניף ראשי',
      max_employees: 4,
      current_employees: 1
    },
    {
      id: '3',
      name: 'משמרת ערב',
      start_time: '16:00',
      end_time: '24:00',
      branch_name: 'סניף מרכז',
      max_employees: 3,
      current_employees: 0
    },
    {
      id: '4',
      name: 'משמרת בוקר מוקדמת',
      start_time: '06:00',
      end_time: '14:00',
      branch_name: 'סניף צפון',
      max_employees: 2,
      current_employees: 1
    }
  ];

  useEffect(() => {
    setAvailableShifts(mockShifts);
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleShiftToggle = (shiftId: string, checked: boolean) => {
    if (!selectedDate) return;

    const shift = availableShifts.find(s => s.id === shiftId);
    if (!shift) return;

    if (checked) {
      const newShift: SelectedShift = {
        date: selectedDate,
        shiftId: shift.id,
        shiftName: shift.name,
        startTime: shift.start_time,
        endTime: shift.end_time,
        branchName: shift.branch_name
      };
      setSelectedShifts(prev => [...prev, newShift]);
    } else {
      setSelectedShifts(prev => 
        prev.filter(s => !(s.shiftId === shiftId && isSameDay(s.date, selectedDate)))
      );
    }
  };

  const isShiftSelected = (shiftId: string): boolean => {
    if (!selectedDate) return false;
    return selectedShifts.some(s => 
      s.shiftId === shiftId && isSameDay(s.date, selectedDate)
    );
  };

  const getShiftAvailability = (shift: ShiftTemplate): 'available' | 'limited' | 'full' => {
    const available = shift.max_employees - shift.current_employees;
    if (available === 0) return 'full';
    if (available <= 2) return 'limited';
    return 'available';
  };

  const getAvailabilityColor = (status: 'available' | 'limited' | 'full'): string => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-red-100 text-red-800';
    }
  };

  const getAvailabilityText = (shift: ShiftTemplate): string => {
    const available = shift.max_employees - shift.current_employees;
    return `${available}/${shift.max_employees} מקומות פנויים`;
  };

  const handleSubmit = () => {
    if (selectedShifts.length === 0) {
      alert('אנא בחר לפחות משמרת אחת');
      return;
    }
    onSubmit(selectedShifts);
  };

  const formatHebrewDate = (date: Date): string => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: he });
  };

  const getSelectedShiftsForDate = (date: Date): SelectedShift[] => {
    return selectedShifts.filter(s => isSameDay(s.date, date));
  };

  const hasShiftsOnDate = (date: Date): boolean => {
    return selectedShifts.some(s => isSameDay(s.date, date));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            הגשת משמרות ובקשות חופשה
          </CardTitle>
          <p className="text-sm text-gray-600">
            בחר תאריכים ומשמרות עד שבועיים קדימה • תחילת שבוע עבודה: יום ראשון
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">לוח שנה</CardTitle>
            <p className="text-sm text-gray-600">
              בחר תאריך להגשת משמרות
            </p>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={he}
              disabled={(date) => 
                isBefore(date, today) || 
                isAfter(date, maxDate)
              }
              modifiers={{
                hasShifts: (date) => hasShiftsOnDate(date)
              }}
              modifiersStyles={{
                hasShifts: {
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontWeight: 'bold'
                }
              }}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>תאריכים עם משמרות נבחרות</span>
              </div>
              <div className="text-xs text-gray-500">
                ניתן לבחור תאריכים עד {format(maxDate, 'd MMMM yyyy', { locale: he })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shift Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? (
                <>משמרות זמינות ל{formatHebrewDate(selectedDate)}</>
              ) : (
                'בחר תאריך מהלוח'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                {availableShifts.map((shift) => {
                  const availability = getShiftAvailability(shift);
                  const isSelected = isShiftSelected(shift.id);
                  const isDisabled = availability === 'full';

                  return (
                    <div
                      key={shift.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                      } ${isDisabled ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleShiftToggle(shift.id, checked as boolean)
                            }
                            disabled={isDisabled}
                            className="mt-1"
                          />
                          <div className="space-y-2">
                            <h4 className="font-medium">{shift.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {shift.start_time} - {shift.end_time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {shift.branch_name}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getAvailabilityColor(availability)}>
                            {getAvailabilityText(shift)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="h-3 w-3" />
                            {shift.current_employees}/{shift.max_employees}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>בחר תאריך כדי לראות משמרות זמינות</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">סיכום בחירות</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedShifts.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-3">
                {selectedShifts.map((shift, index) => (
                  <div
                    key={`${shift.date.toISOString()}-${shift.shiftId}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{shift.shiftName}</div>
                      <div className="text-sm text-gray-600">
                        {formatHebrewDate(shift.date)} • {shift.startTime}-{shift.endTime} • {shift.branchName}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedShifts(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      הסר
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSubmit} className="flex-1">
                  שלח בקשת משמרות ({selectedShifts.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedShifts([])}
                  className="flex-1"
                >
                  נקה הכל
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>לא נבחרו משמרות</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vacation Request */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">בקשת חופשה</CardTitle>
          <p className="text-sm text-gray-600">
            הגש בקשה לחופשה עד חודשיים מראש (בלי קשר להגשת משמרות)
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={onVacationRequest}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            הגש בקשת חופשה חדשה
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
