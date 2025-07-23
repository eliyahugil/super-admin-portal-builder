import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Users, Building, Copy, CalendarDays } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns';
import { he } from 'date-fns/locale';

interface ScheduledShift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  branch_id: string;
  role: string;
  required_employees?: number;
  employee_id?: string;
  employees?: { first_name: string; last_name: string };
  branches?: { name: string };
}

interface CopyPreviousScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate?: Date;
  onShiftsCreated: () => void;
}

export const CopyPreviousScheduleDialog: React.FC<CopyPreviousScheduleDialogProps> = ({
  isOpen,
  onClose,
  targetDate,
  onShiftsCreated
}) => {
  const { businessId } = useBusiness();
  const { toast } = useToast();
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());
  const [selectedSourceWeek, setSelectedSourceWeek] = useState<Date | null>(null);
  const [copyAsUnassigned, setCopyAsUnassigned] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // בחירת שבועות קודמים לבחירה
  const getWeekOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 1; i <= 8; i++) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      options.push({
        start: weekStart,
        end: weekEnd,
        label: `שבוע ${format(weekStart, 'dd/MM', { locale: he })} - ${format(weekEnd, 'dd/MM', { locale: he })}`
      });
    }
    return options;
  };

  const weekOptions = getWeekOptions();

  // שליפת משמרות מהשבוע הנבחר
  const { data: previousShifts = [] } = useRealData<ScheduledShift>({
    queryKey: ['previous-shifts', businessId, selectedSourceWeek?.toISOString()],
    tableName: 'scheduled_shifts',
    select: `
      id,
      shift_date,
      start_time,
      end_time,
      branch_id,
      role,
      required_employees,
      employee_id,
      employees:employee_id (first_name, last_name),
      branches:branch_id (name)
    `,
    filters: selectedSourceWeek ? {
      shift_date: {
        gte: format(startOfWeek(selectedSourceWeek, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
        lte: format(endOfWeek(selectedSourceWeek, { weekStartsOn: 0 }), 'yyyy-MM-dd')
      }
    } : {},
    enabled: !!businessId && !!selectedSourceWeek && isOpen
  });

  const handleShiftSelect = (shiftId: string) => {
    const newSelected = new Set(selectedShifts);
    if (newSelected.has(shiftId)) {
      newSelected.delete(shiftId);
    } else {
      newSelected.add(shiftId);
    }
    setSelectedShifts(newSelected);
  };

  const selectAllShifts = () => {
    if (selectedShifts.size === previousShifts.length) {
      setSelectedShifts(new Set());
    } else {
      setSelectedShifts(new Set(previousShifts.map(shift => shift.id)));
    }
  };

  const copySelectedShifts = async () => {
    if (!targetDate || selectedShifts.size === 0) {
      toast({
        title: "שגיאה",
        description: "אנא בחר משמרות וודא שיש תאריך יעד",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const selectedShiftData = previousShifts.filter(s => selectedShifts.has(s.id));
      const shifts = [];

      // חישוב הפרש הימים בין השבוע המקור לשבוע היעד
      const sourceWeekStart = startOfWeek(new Date(selectedShiftData[0]?.shift_date), { weekStartsOn: 0 });
      const targetWeekStart = startOfWeek(targetDate, { weekStartsOn: 0 });
      const daysDiff = Math.floor((targetWeekStart.getTime() - sourceWeekStart.getTime()) / (1000 * 60 * 60 * 24));

      for (const shift of selectedShiftData) {
        const originalDate = new Date(shift.shift_date);
        const newDate = addDays(originalDate, daysDiff);

        const newShift: any = {
          shift_date: format(newDate, 'yyyy-MM-dd'),
          start_time: shift.start_time,
          end_time: shift.end_time,
          branch_id: shift.branch_id,
          role: shift.role,
          required_employees: shift.required_employees || 1,
          business_id: businessId,
          employee_id: copyAsUnassigned ? null : shift.employee_id,
          notes: `הועתק מסידור ${format(new Date(shift.shift_date), 'dd/MM/yyyy', { locale: he })}`,
          status: copyAsUnassigned ? 'open' : 'assigned'
        };

        shifts.push(newShift);
      }

      // אם מעתיקים כמשמרות לא מוקצות, ניצור available_shifts
      if (copyAsUnassigned) {
        const { error } = await supabase
          .from('available_shifts')
          .insert(shifts.map(shift => ({
            business_id: shift.business_id,
            branch_id: shift.branch_id,
            shift_name: `${shift.role} - הועתק`,
            shift_type: shift.role.toLowerCase(),
            start_time: shift.start_time,
            end_time: shift.end_time,
            day_of_week: new Date(shift.shift_date).getDay(),
            week_start_date: format(startOfWeek(new Date(shift.shift_date), { weekStartsOn: 0 }), 'yyyy-MM-dd'),
            week_end_date: format(endOfWeek(new Date(shift.shift_date), { weekStartsOn: 0 }), 'yyyy-MM-dd'),
            required_employees: shift.required_employees,
            current_assignments: 0,
            is_open_for_unassigned: true
          })));

        if (error) throw error;
      } else {
        // אם מעתיקים כמשמרות מוקצות
        const { error } = await supabase
          .from('scheduled_shifts')
          .insert(shifts);

        if (error) throw error;
      }

      toast({
        title: "הצלחה",
        description: `הועתקו ${shifts.length} משמרות ${copyAsUnassigned ? 'כמשמרות לא מוקצות' : 'עם השיוכים המקוריים'}`
      });

      setSelectedShifts(new Set());
      setSelectedSourceWeek(null);
      onShiftsCreated();
      onClose();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה בהעתקת משמרות: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getEmployeeName = (shift: ScheduledShift) => {
    if (!shift.employee_id || !shift.employees) return 'לא משויך';
    return `${shift.employees.first_name} ${shift.employees.last_name}`;
  };

  const getBranchName = (shift: ScheduledShift) => {
    return shift.branches?.name || 'לא מוגדר';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            העתקת משמרות מסידור קודם
          </DialogTitle>
          {targetDate && (
            <p className="text-sm text-muted-foreground">
              יעד להעתקה: שבוע {format(startOfWeek(targetDate, { weekStartsOn: 0 }), 'dd/MM/yyyy', { locale: he })}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* בחירת שבוע מקור */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">בחר שבוע לגישה</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {weekOptions.map((week, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    selectedSourceWeek?.getTime() === week.start.getTime()
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSourceWeek(week.start)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-sm font-medium">{week.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(week.start, 'yyyy', { locale: he })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* אפשרויות העתקה */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">אפשרויות העתקה</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-as-unassigned"
                checked={copyAsUnassigned}
                onCheckedChange={(checked) => setCopyAsUnassigned(checked === true)}
              />
              <Label htmlFor="copy-as-unassigned" className="cursor-pointer">
                העתק כמשמרות לא מוקצות (עובדים יכולים להגיש בקשות)
              </Label>
            </div>
            {!copyAsUnassigned && (
              <p className="text-sm text-muted-foreground mr-6">
                המשמרות יועתקו עם השיוכים המקוריים לעובדים
              </p>
            )}
          </div>

          {/* רשימת משמרות */}
          {selectedSourceWeek && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  משמרות זמינות ({previousShifts.length})
                </Label>
                {previousShifts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllShifts}
                  >
                    {selectedShifts.size === previousShifts.length ? 'בטל בחירת הכל' : 'בחר הכל'}
                  </Button>
                )}
              </div>
              
              {previousShifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>אין משמרות בשבוע הנבחר</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {previousShifts.map((shift) => (
                    <Card 
                      key={shift.id}
                      className={`cursor-pointer transition-colors ${
                        selectedShifts.has(shift.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleShiftSelect(shift.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {format(new Date(shift.shift_date), 'EEEE dd/MM', { locale: he })}
                          </CardTitle>
                          <Checkbox
                            checked={selectedShifts.has(shift.id)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{shift.start_time} - {shift.end_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{getBranchName(shift)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{getEmployeeName(shift)}</span>
                          </div>
                          <div>
                            <Badge variant="secondary" className="text-xs">
                              {shift.role}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* סיכום */}
          {selectedShifts.size > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">סיכום</h4>
              <p className="text-sm text-muted-foreground">
                {selectedShifts.size} משמרות נבחרו להעתקה
                {copyAsUnassigned 
                  ? ' • יועתקו כמשמרות לא מוקצות'
                  : ' • יועתקו עם השיוכים המקוריים'
                }
              </p>
            </div>
          )}

          {/* כפתורי פעולה */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              onClick={copySelectedShifts}
              disabled={selectedShifts.size === 0 || isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  מעתיק משמרות...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  העתק משמרות ({selectedShifts.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};