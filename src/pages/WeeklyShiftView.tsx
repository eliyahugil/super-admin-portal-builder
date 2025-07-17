import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, User, Building, CheckCircle, Clock4, Star, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

interface WeeklyShiftsData {
  success: boolean;
  tokenData: {
    id: string;
    token: string;
    employeeId: string;
    weekStart: string;
    weekEnd: string;
    expiresAt: string;
    employee: {
      id: string;
      first_name: string;
      last_name: string;
      employee_id: string;
      phone: string;
      business_id: string;
      shift_submission_quota?: number;
      preferred_shift_time?: string;
      can_choose_unassigned_shifts?: boolean;
      business: {
        id: string;
        name: string;
      };
    };
  };
  context: {
    type: 'available_shifts' | 'assigned_shifts';
    title: string;
    description: string;
    shiftsPublished: boolean;
  };
  shifts: any[];
  shiftsCount: number;
  employeePreferences?: {
    shift_types: string[];
    available_days: number[];
  };
}

interface ShiftChoice {
  shiftId: string;
  weekStartDate: string;
  choiceType: 'regular' | 'unassigned_request';
  preferenceLevel: number;
  notes?: string;
}

type ViewMode = 'view' | 'select' | 'submitting' | 'submitted';

const daysOfWeek = [
  'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'
];

export const WeeklyShiftView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isValidating, setIsValidating] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());
  const [shiftPreferences, setShiftPreferences] = useState<Record<string, number>>({});
  const [shiftNotes, setShiftNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const { data: shiftsData, error, isLoading } = useQuery({
    queryKey: ['weekly-shifts-context', token],
    queryFn: async (): Promise<WeeklyShiftsData> => {
      const { data, error } = await supabase.functions.invoke('get-weekly-shifts-context', {
        body: { token }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!token,
    refetchInterval: 30000, // Refresh every 30 seconds to check for updates
  });

  const submitChoicesMutation = useMutation({
    mutationFn: async (choices: ShiftChoice[]) => {
      const { data, error } = await supabase.functions.invoke('submit-shift-choices', {
        body: { token, choices }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setViewMode('submitted');
      toast({
        title: "המשמרות נשלחו בהצלחה!",
        description: `נשלחו ${data.choicesCount} בחירות משמרות`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "שגיאה בשליחת המשמרות",
        description: error?.message || "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading) {
      setIsValidating(false);
    }
  }, [isLoading]);

  const handleShiftSelection = (shiftId: string, checked: boolean) => {
    const newSelected = new Set(selectedShifts);
    if (checked) {
      newSelected.add(shiftId);
      setShiftPreferences(prev => ({ ...prev, [shiftId]: 1 }));
    } else {
      newSelected.delete(shiftId);
      const newPrefs = { ...shiftPreferences };
      const newNotes = { ...shiftNotes };
      delete newPrefs[shiftId];
      delete newNotes[shiftId];
      setShiftPreferences(newPrefs);
      setShiftNotes(newNotes);
    }
    setSelectedShifts(newSelected);
  };

  const handleSubmitChoices = () => {
    if (selectedShifts.size === 0) {
      toast({
        title: "לא נבחרו משמרות",
        description: "אנא בחר לפחות משמרת אחת לפני השליחה",
        variant: "destructive",
      });
      return;
    }

    const choices: ShiftChoice[] = Array.from(selectedShifts).map(shiftId => {
      const shift = regularShifts.find(s => s.id === shiftId) || additionalShifts.find(s => s.id === shiftId);
      const isAdditionalShift = additionalShifts.find(s => s.id === shiftId);
      
      return {
        shiftId,
        weekStartDate: shiftsData?.tokenData.weekStart || '',
        choiceType: isAdditionalShift ? 'unassigned_request' : 'regular',
        preferenceLevel: shiftPreferences[shiftId] || 1,
        notes: shiftNotes[shiftId] || undefined,
      };
    });

    setViewMode('submitting');
    submitChoicesMutation.mutate(choices);
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !shiftsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">שגיאה באימות הטוכן</CardTitle>
              <CardDescription>
                הטוכן שהזנת לא תקין או שפג תוקפו. אנא פנה למנהל העבודה לקבלת טוכן חדש.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const { tokenData, context, shifts, employeePreferences } = shiftsData;
  const isAvailableShifts = context.type === 'available_shifts';
  const quota = tokenData.employee.shift_submission_quota || 3;
  const canChooseUnassigned = tokenData.employee.can_choose_unassigned_shifts !== false;

  // סינון משמרות לפי העדפות העובד
  const preferredShiftTypes = employeePreferences?.shift_types || [];
  const preferredDays = employeePreferences?.available_days || [];
  
  const regularShifts = shifts.filter(shift => {
    const shiftDayOfWeek = shift.day_of_week;
    const shiftType = shift.shift_type?.toLowerCase();
    return preferredDays.includes(shiftDayOfWeek) && 
           (preferredShiftTypes.length === 0 || preferredShiftTypes.some(type => 
             type.toLowerCase() === shiftType || 
             (type === 'morning' && shiftType === 'בוקר') ||
             (type === 'evening' && shiftType === 'ערב') ||
             (type === 'night' && shiftType === 'לילה')
           ));
  });

  const additionalShifts = canChooseUnassigned ? 
    shifts.filter(shift => !regularShifts.find(rs => rs.id === shift.id)) : 
    [];

  const formatShiftTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const formatShiftDate = (dateStr: string, dayOfWeek?: number) => {
    if (dayOfWeek !== undefined) {
      return daysOfWeek[dayOfWeek];
    }
    try {
      return format(parseISO(dateStr), 'EEEE, dd/MM', { locale: he });
    } catch {
      return dateStr;
    }
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType?.toLowerCase()) {
      case 'morning':
      case 'בוקר':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'evening':
      case 'ערב':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'night':
      case 'לילה':
        return 'bg-slate-500/10 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {context.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {context.description}
          </p>
        </div>

        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטי העובד
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">שם:</span>
              <span>{tokenData.employee.first_name} {tokenData.employee.last_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">מספר עובד:</span>
              <span>{tokenData.employee.employee_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="font-medium">עסק:</span>
              <span>{tokenData.employee.business.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">שבוע:</span>
              <span>
                {format(parseISO(tokenData.weekStart), 'dd/MM/yyyy', { locale: he })} - {' '}
                {format(parseISO(tokenData.weekEnd), 'dd/MM/yyyy', { locale: he })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status Badge and Actions */}
        <div className="flex flex-col items-center gap-4">
          <Badge 
            variant={isAvailableShifts ? "outline" : "default"}
            className={`text-sm px-4 py-2 ${
              isAvailableShifts 
                ? 'border-orange-200 bg-orange-50 text-orange-700' 
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
          >
            {isAvailableShifts ? (
              <>
                <Clock4 className="h-4 w-4 mr-2" />
                ממתין לפרסום המשמרות
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                המשמרות פורסמו
              </>
            )}
          </Badge>

          {/* Action buttons for available shifts */}
          {isAvailableShifts && shifts.length > 0 && viewMode === 'view' && (
            <Button 
              onClick={() => setViewMode('select')}
              className="bg-primary hover:bg-primary/90"
            >
              בחירת משמרות
            </Button>
          )}

          {viewMode === 'select' && (
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setViewMode('view')}
              >
                ביטול
              </Button>
              <Button 
                onClick={handleSubmitChoices}
                disabled={selectedShifts.size === 0}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                שליחת בחירות ({selectedShifts.size}/{quota})
              </Button>
            </div>
          )}

          {viewMode === 'submitting' && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>שולח...</span>
            </div>
          )}

          {viewMode === 'submitted' && (
            <Card className="max-w-md">
              <CardContent className="text-center py-6">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">המשמרות נשלחו בהצלחה!</h3>
                <p className="text-muted-foreground">
                  בחירות המשמרות שלך נשלחו למערכת ויטופלו על ידי המנהל.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Shifts Grid */}
        {(regularShifts.length > 0 || additionalShifts.length > 0) && viewMode !== 'submitted' ? (
          <div className="space-y-8">
            {/* Regular Shifts Section */}
            {regularShifts.length > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground">
                    המשמרות המועדפות שלך
                  </h3>
                  <p className="text-muted-foreground">
                    משמרות שמתאימות להעדפות שהוגדרו בכרטיס העובד שלך
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {regularShifts.map((shift, index) => (
                    <ShiftCard 
                      key={shift.id || `regular-${index}`}
                      shift={shift}
                      isSelected={selectedShifts.has(shift.id)}
                      onSelectionChange={handleShiftSelection}
                      viewMode={viewMode}
                      isAvailableShifts={isAvailableShifts}
                      selectedShifts={selectedShifts}
                      quota={quota}
                      shiftPreferences={shiftPreferences}
                      setShiftPreferences={setShiftPreferences}
                      shiftNotes={shiftNotes}
                      setShiftNotes={setShiftNotes}
                      formatShiftDate={formatShiftDate}
                      formatShiftTime={formatShiftTime}
                      getShiftTypeColor={getShiftTypeColor}
                      choiceType="regular"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Additional Shifts Section */}
            {additionalShifts.length > 0 && canChooseUnassigned && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground">
                    משמרות נוספות זמינות
                  </h3>
                  <p className="text-muted-foreground">
                    משמרות שאינן בהעדפות הרגילות שלך - ניתן לבחור כבקשה נוספת
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {additionalShifts.map((shift, index) => (
                    <ShiftCard 
                      key={shift.id || `additional-${index}`}
                      shift={shift}
                      isSelected={selectedShifts.has(shift.id)}
                      onSelectionChange={handleShiftSelection}
                      viewMode={viewMode}
                      isAvailableShifts={isAvailableShifts}
                      selectedShifts={selectedShifts}
                      quota={quota}
                      shiftPreferences={shiftPreferences}
                      setShiftPreferences={setShiftPreferences}
                      shiftNotes={shiftNotes}
                      setShiftNotes={setShiftNotes}
                      formatShiftDate={formatShiftDate}
                      formatShiftTime={formatShiftTime}
                      getShiftTypeColor={getShiftTypeColor}
                      choiceType="unassigned_request"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isAvailableShifts ? 'אין משמרות זמינות' : 'אין משמרות מוקצות'}
              </h3>
              <p className="text-muted-foreground">
                {isAvailableShifts 
                  ? 'טרם הוגדרו משמרות זמינות לשבוע זה'
                  : 'לא הוקצו לך משמרות לשבוע זה'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-6">
          <p>הטוכן תקף עד: {format(parseISO(tokenData.expiresAt), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
          <p className="mt-2">העמוד מתעדכן אוטומטית כל 30 שניות</p>
        </div>
      </div>
    </div>
  );
};

// Component for individual shift card
interface ShiftCardProps {
  shift: any;
  isSelected: boolean;
  onSelectionChange: (shiftId: string, checked: boolean) => void;
  viewMode: ViewMode;
  isAvailableShifts: boolean;
  selectedShifts: Set<string>;
  quota: number;
  shiftPreferences: Record<string, number>;
  setShiftPreferences: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  shiftNotes: Record<string, string>;
  setShiftNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  formatShiftDate: (dateStr: string, dayOfWeek?: number) => string;
  formatShiftTime: (startTime: string, endTime: string) => string;
  getShiftTypeColor: (shiftType: string) => string;
  choiceType: 'regular' | 'unassigned_request';
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  isSelected,
  onSelectionChange,
  viewMode,
  isAvailableShifts,
  selectedShifts,
  quota,
  shiftPreferences,
  setShiftPreferences,
  shiftNotes,
  setShiftNotes,
  formatShiftDate,
  formatShiftTime,
  getShiftTypeColor,
  choiceType
}) => {
  return (
    <Card 
      className={`hover:shadow-lg transition-all ${
        viewMode === 'select' && isSelected 
          ? 'ring-2 ring-primary bg-primary/5' 
          : ''
      } ${
        choiceType === 'unassigned_request' 
          ? 'border-dashed border-orange-200 bg-orange-50/30' 
          : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewMode === 'select' && isAvailableShifts && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => 
                  onSelectionChange(shift.id, checked as boolean)
                }
                disabled={!isSelected && selectedShifts.size >= quota}
              />
            )}
            <CardTitle className="text-lg">
              {isAvailableShifts 
                ? formatShiftDate(shift.week_start_date, shift.day_of_week)
                : formatShiftDate(shift.shift_date)
              }
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {choiceType === 'unassigned_request' && (
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                בקשה נוספת
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={getShiftTypeColor(shift.shift_type)}
            >
              {shift.shift_type || shift.shift_name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {formatShiftTime(shift.start_time, shift.end_time)}
          </span>
        </div>
        
        {shift.branch && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{shift.branch.name}</div>
              {shift.branch.address && (
                <div className="text-muted-foreground text-xs">
                  {shift.branch.address}
                </div>
              )}
            </div>
          </div>
        )}
        
        {isAvailableShifts && shift.required_employees && (
          <div className="text-sm text-muted-foreground">
            דרושים: {shift.required_employees} עובדים
          </div>
        )}
        
        {!isAvailableShifts && shift.notes && (
          <div className="text-sm bg-muted p-2 rounded">
            <span className="font-medium">הערות: </span>
            {shift.notes}
          </div>
        )}

        {/* Selection Controls */}
        {viewMode === 'select' && isSelected && (
          <div className="border-t pt-3 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">רמת עדיפות:</span>
              </div>
              <Select
                value={shiftPreferences[shift.id]?.toString() || "1"}
                onValueChange={(value) => 
                  setShiftPreferences(prev => ({ 
                    ...prev, 
                    [shift.id]: parseInt(value) 
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - עדיפות גבוהה</SelectItem>
                  <SelectItem value="2">2 - עדיפות בינונית</SelectItem>
                  <SelectItem value="3">3 - עדיפות נמוכה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">הערות (אופציונלי):</span>
              <Textarea
                placeholder="הוסף הערות למשמרת זו..."
                value={shiftNotes[shift.id] || ''}
                onChange={(e) => 
                  setShiftNotes(prev => ({ 
                    ...prev, 
                    [shift.id]: e.target.value 
                  }))
                }
                className="min-h-[60px]"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};