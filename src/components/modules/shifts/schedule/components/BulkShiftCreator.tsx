import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Copy, Wand2, Clock, Users } from 'lucide-react';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { useRealData } from '@/hooks/useRealData';
import { toast } from '@/hooks/use-toast';
import { useOptimizedShiftMutations } from '@/components/modules/shifts/schedule/hooks/useOptimizedShiftMutations';

interface BulkShiftCreatorProps {
  businessId: string;
  onSuccess?: () => void;
}

const WEEKDAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export const BulkShiftCreator: React.FC<BulkShiftCreatorProps> = ({
  businessId,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => new Date());
  const [selectedSourceWeek, setSelectedSourceWeek] = useState(() => addWeeks(new Date(), -1));
  const [copiedShifts, setCopiedShifts] = useState<any[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());
  const [targetWeeksCount, setTargetWeeksCount] = useState(1);
  const [applySmart, setApplySmart] = useState(true);

  const { createShift, isCreating } = useOptimizedShiftMutations(businessId);

  // טעינת משמרות מהשבוע המקור
  const sourceWeekStart = startOfWeek(selectedSourceWeek, { weekStartsOn: 0 });
  const sourceWeekEnd = endOfWeek(selectedSourceWeek, { weekStartsOn: 0 });

  const { data: sourceShifts = [], refetch: refetchSource } = useRealData<any>({
    queryKey: ['bulk-source-shifts', businessId, sourceWeekStart.toISOString()],
    tableName: 'scheduled_shifts',
    select: `
      *,
      employees!inner (
        id,
        first_name,
        last_name,
        is_active
      ),
      branches!inner (
        id,
        name,
        is_active
      )
    `,
    filters: {
      business_id: businessId,
      shift_date: {
        gte: sourceWeekStart.toISOString().split('T')[0],
        lte: sourceWeekEnd.toISOString().split('T')[0]
      }
    },
    enabled: !!businessId && open,
  });

  // טעינת עובדים זמינים
  const { data: employees = [] } = useRealData<any>({
    queryKey: ['bulk-employees', businessId],
    tableName: 'employees',
    filters: { 
      business_id: businessId, 
      is_active: true, 
      is_archived: false 
    },
    enabled: !!businessId && open,
  });

  // טעינת סניפים
  const { data: branches = [] } = useRealData<any>({
    queryKey: ['bulk-branches', businessId],
    tableName: 'branches',
    filters: { business_id: businessId, is_active: true },
    enabled: !!businessId && open,
  });

  const handleLoadShifts = () => {
    if (sourceShifts.length === 0) {
      toast({
        title: 'אין משמרות',
        description: 'לא נמצאו משמרות בשבוע שנבחר',
        variant: 'destructive',
      });
      return;
    }
    setCopiedShifts(sourceShifts);
    setSelectedShifts(new Set(sourceShifts.map((s: any) => s.id)));
    toast({
      title: 'משמרות נטענו',
      description: `נטענו ${sourceShifts.length} משמרות מהשבוע שנבחר`,
    });
  };

  const handleSelectShift = (shiftId: string, selected: boolean) => {
    const newSelected = new Set(selectedShifts);
    if (selected) {
      newSelected.add(shiftId);
    } else {
      newSelected.delete(shiftId);
    }
    setSelectedShifts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedShifts.size === copiedShifts.length) {
      setSelectedShifts(new Set());
    } else {
      setSelectedShifts(new Set(copiedShifts.map(s => s.id)));
    }
  };

  const handleCreateShifts = async () => {
    const selectedShiftData = copiedShifts.filter(shift => selectedShifts.has(shift.id));
    if (selectedShiftData.length === 0) {
      toast({
        title: 'לא נבחרו משמרות',
        description: 'אנא בחר לפחות משמרת אחת להעתקה',
        variant: 'destructive',
      });
      return;
    }

    const targetWeekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
    const createdShifts: any[] = [];

    try {
      for (let weekIndex = 0; weekIndex < targetWeeksCount; weekIndex++) {
        const currentWeekStart = addWeeks(targetWeekStart, weekIndex);
        
        for (const shift of selectedShiftData) {
          const originalDate = new Date(shift.shift_date);
          const dayOfWeek = originalDate.getDay();
          const targetDate = addDays(currentWeekStart, dayOfWeek);
          
          // בדיקה חכמה - האם העובד זמין ופעיל
          const employee = employees.find((e: any) => e.id === shift.employee_id);
          const branch = branches.find((b: any) => b.id === shift.branch_id);
          
          if (applySmart && (!employee?.is_active || !branch?.is_active)) {
            console.log(`דילוג על משמרת עבור עובד/סניף לא פעיל: ${employee?.first_name} ${employee?.last_name}`);
            continue;
          }

          const newShift = {
            business_id: businessId,
            shift_date: targetDate.toISOString().split('T')[0],
            start_time: shift.start_time,
            end_time: shift.end_time,
            employee_id: shift.employee_id,
            branch_id: shift.branch_id,
            shift_type: shift.shift_type,
            status: 'assigned' as const,
            notes: shift.notes || `הועתק מתאריך ${format(originalDate, 'dd/MM/yyyy')}`,
            required_employees: shift.required_employees || 1,
            shift_assignments: shift.shift_assignments || null,
            is_new: true,
          };

          await createShift(newShift);
          createdShifts.push(newShift);
        }
      }

      toast({
        title: 'משמרות נוצרו בהצלחה',
        description: `נוצרו ${createdShifts.length} משמרות חדשות ב-${targetWeeksCount} שבועות`,
      });

      setOpen(false);
      setCopiedShifts([]);
      setSelectedShifts(new Set());
      onSuccess?.();

    } catch (error) {
      console.error('Error creating bulk shifts:', error);
      toast({
        title: 'שגיאה ביצירת משמרות',
        description: 'אירעה שגיאה ביצירת המשמרות. אנא נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  const getShiftsByDay = (shifts: any[]) => {
    const byDay: { [key: number]: any[] } = {};
    shifts.forEach(shift => {
      const dayOfWeek = new Date(shift.shift_date).getDay();
      if (!byDay[dayOfWeek]) byDay[dayOfWeek] = [];
      byDay[dayOfWeek].push(shift);
    });
    return byDay;
  };

  const shiftsByDay = getShiftsByDay(copiedShifts);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Wand2 className="h-4 w-4" />
          יצירה מרובה של משמרות
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            יצירה מרובה ויעילה של משמרות
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* שלב 1: בחירת שבוע מקור */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Copy className="h-5 w-5" />
                שלב 1: בחר שבוע מקור להעתקה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>שבוע מקור:</Label>
                <input
                  type="week"
                  value={format(selectedSourceWeek, 'yyyy-\\WW')}
                  onChange={(e) => {
                    const [year, week] = e.target.value.split('-W');
                    const weekDate = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
                    setSelectedSourceWeek(weekDate);
                  }}
                  className="px-3 py-2 border rounded-lg"
                />
                <Button onClick={handleLoadShifts} variant="outline">
                  טען משמרות ({sourceShifts.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* שלב 2: בחירת משמרות */}
          {copiedShifts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  שלב 2: בחר משמרות להעתקה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button onClick={handleSelectAll} variant="outline" size="sm">
                    {selectedShifts.size === copiedShifts.length ? 'בטל בחירת הכל' : 'בחר הכל'}
                  </Button>
                  <Badge variant="secondary">
                    נבחרו {selectedShifts.size} מתוך {copiedShifts.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {WEEKDAY_NAMES.map((day, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-sm font-medium text-center p-2 bg-gray-100 rounded">
                        {day}
                      </div>
                      {shiftsByDay[index]?.map((shift: any) => (
                        <div
                          key={shift.id}
                          className={`p-2 text-xs border rounded cursor-pointer transition-colors ${
                            selectedShifts.has(shift.id)
                              ? 'bg-blue-100 border-blue-500'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => handleSelectShift(shift.id, !selectedShifts.has(shift.id))}
                        >
                          <div className="font-medium">
                            {shift.start_time} - {shift.end_time}
                          </div>
                          <div className="text-gray-600">
                            {shift.employees?.first_name} {shift.employees?.last_name}
                          </div>
                          <div className="text-gray-500">
                            {shift.branches?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* שלב 3: הגדרות יעד */}
          {selectedShifts.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  שלב 3: הגדר יעד ההעתקה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שבוע התחלה:</Label>
                    <input
                      type="week"
                      value={format(selectedWeek, 'yyyy-\\WW')}
                      onChange={(e) => {
                        const [year, week] = e.target.value.split('-W');
                        const weekDate = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
                        setSelectedWeek(weekDate);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>מספר שבועות:</Label>
                    <Select 
                      value={targetWeeksCount.toString()} 
                      onValueChange={(value) => setTargetWeeksCount(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'שבוע' : 'שבועות'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <Label className="font-medium">יצירה חכמה</Label>
                    <p className="text-sm text-gray-600">
                      דלג על עובדים או סניפים לא פעילים
                    </p>
                  </div>
                  <Switch
                    checked={applySmart}
                    onCheckedChange={setApplySmart}
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    יווצרו {selectedShifts.size * targetWeeksCount} משמרות חדשות
                  </div>
                  <Button 
                    onClick={handleCreateShifts}
                    disabled={isCreating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCreating ? 'יוצר...' : 'צור משמרות'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};