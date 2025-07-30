import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Copy, Zap, Clock, Users, Building } from 'lucide-react';
import { format, subWeeks, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';
import { useRealData } from '@/hooks/useRealData';
import { toast } from '@/hooks/use-toast';

interface QuickShiftCreationOptionsProps {
  businessId: string;
  onCopyShifts: (shifts: any[]) => void;
  onCreateFromTemplate: (template: any) => void;
}

const WEEKDAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export const QuickShiftCreationOptions: React.FC<QuickShiftCreationOptionsProps> = ({
  businessId,
  onCopyShifts,
  onCreateFromTemplate
}) => {
  const [selectedWeek, setSelectedWeek] = useState(() => subWeeks(new Date(), 1));
  const [selectedTemplateWeek, setSelectedTemplateWeek] = useState(() => new Date());

  // טעינת משמרות מהשבוע הקודם
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });

  const { data: previousWeekShifts = [], isLoading: loadingPrevious } = useRealData<any>({
    queryKey: ['previous-week-shifts', businessId, weekStart.toISOString()],
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
        gte: weekStart.toISOString().split('T')[0],
        lte: weekEnd.toISOString().split('T')[0]
      }
    },
    enabled: !!businessId,
  });

  console.log('🔍 QuickShiftCreationOptions - Previous week shifts:', {
    businessId,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    shiftsCount: previousWeekShifts?.length || 0,
    shifts: previousWeekShifts
  });

  // טעינת תבניות שבועיות קיימות
  const templateWeekStart = startOfWeek(selectedTemplateWeek, { weekStartsOn: 0 });
  const templateWeekEnd = endOfWeek(selectedTemplateWeek, { weekStartsOn: 0 });

  const { data: templateWeekShifts = [], isLoading: loadingTemplates } = useRealData<any>({
    queryKey: ['template-week-shifts', businessId, templateWeekStart.toISOString()],
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
        gte: templateWeekStart.toISOString().split('T')[0],
        lte: templateWeekEnd.toISOString().split('T')[0]
      }
    },
    enabled: !!businessId,
  });

  console.log('🔍 QuickShiftCreationOptions - Template week shifts:', {
    businessId,
    templateWeekStart: templateWeekStart.toISOString(),
    templateWeekEnd: templateWeekEnd.toISOString(),
    shiftsCount: templateWeekShifts?.length || 0,
    shifts: templateWeekShifts
  });

  // טעינת תבניות משמרות
  const { data: shiftTemplates = [] } = useRealData<any>({
    queryKey: ['quick-shift-templates', businessId],
    tableName: 'shift_templates',
    filters: { business_id: businessId, is_active: true },
    enabled: !!businessId,
  });

  console.log('🔍 QuickShiftCreationOptions - Shift templates:', {
    businessId,
    templatesCount: shiftTemplates?.length || 0,
    templates: shiftTemplates
  });

  const handleCopyFromPreviousWeek = () => {
    if (previousWeekShifts.length === 0) {
      toast({
        title: 'אין משמרות',
        description: 'לא נמצאו משמרות בשבוע שנבחר',
        variant: 'destructive',
      });
      return;
    }

    const processedShifts = previousWeekShifts.map(shift => ({
      ...shift,
      id: undefined, // יצירת משמרת חדשה
      shift_date: null, // יקבע בהמשך
      created_at: undefined,
      updated_at: undefined,
    }));

    onCopyShifts(processedShifts);
    toast({
      title: 'הועתקו משמרות',
      description: `הועתקו ${previousWeekShifts.length} משמרות מהשבוע שנבחר`,
    });
  };

  const handleCopyFromTemplateWeek = () => {
    if (templateWeekShifts.length === 0) {
      toast({
        title: 'אין משמרות',
        description: 'לא נמצאו משמרות בשבוע התבנית שנבחר',
        variant: 'destructive',
      });
      return;
    }

    const processedShifts = templateWeekShifts.map(shift => ({
      ...shift,
      id: undefined,
      shift_date: null,
      created_at: undefined,
      updated_at: undefined,
    }));

    onCopyShifts(processedShifts);
    toast({
      title: 'הועתקו משמרות מתבנית',
      description: `הועתקו ${templateWeekShifts.length} משמרות מהשבוע התבנית`,
    });
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

  const previousWeekByDay = getShiftsByDay(previousWeekShifts);
  const templateWeekByDay = getShiftsByDay(templateWeekShifts);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="h-5 w-5" />
            יצירה מהירה ויעילה של משמרות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* העתקה מהשבוע הקודם */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-gray-800">
              <Copy className="h-4 w-4" />
              העתק משמרות מהשבוע הקודם
            </h4>
            
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="week"
                value={format(selectedWeek, "yyyy-'W'ww")}
                onChange={(e) => {
                  const [year, week] = e.target.value.split('-W');
                  const weekDate = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
                  setSelectedWeek(weekDate);
                }}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              
              <Button
                type="button"
                onClick={handleCopyFromPreviousWeek}
                disabled={loadingPrevious || previousWeekShifts.length === 0}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                העתק {previousWeekShifts.length} משמרות
              </Button>
            </div>

            {previousWeekShifts.length > 0 ? (
              <div className="grid grid-cols-7 gap-1 mt-2">
                {WEEKDAY_NAMES.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">{day}</div>
                    <Badge variant={previousWeekByDay[index] ? "default" : "secondary"} className="text-xs">
                      {previousWeekByDay[index]?.length || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                אין משמרות בשבוע שנבחר. בחר שבוע אחר או צור משמרות ידנית תחילה.
              </div>
            )}
          </div>

          <Separator />

          {/* העתקה מתבנית שבועית */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-gray-800">
              <Calendar className="h-4 w-4" />
              העתק תבנית שבועית
            </h4>
            
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="week"
                value={format(selectedTemplateWeek, "yyyy-'W'ww")}
                onChange={(e) => {
                  const [year, week] = e.target.value.split('-W');
                  const weekDate = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
                  setSelectedTemplateWeek(weekDate);
                }}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              
              <Button
                type="button"
                onClick={handleCopyFromTemplateWeek}
                disabled={loadingTemplates || templateWeekShifts.length === 0}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                העתק תבנית ({templateWeekShifts.length} משמרות)
              </Button>
            </div>

            {templateWeekShifts.length > 0 ? (
              <div className="grid grid-cols-7 gap-1 mt-2">
                {WEEKDAY_NAMES.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">{day}</div>
                    <Badge variant={templateWeekByDay[index] ? "default" : "secondary"} className="text-xs">
                      {templateWeekByDay[index]?.length || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                אין משמרות בשבוע התבנית שנבחר. בחר שבוע אחר או צור משמרות תחילה.
              </div>
            )}
          </div>

          <Separator />

          {/* תבניות משמרות מהירות */}
          {shiftTemplates.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-gray-800">
                <Clock className="h-4 w-4" />
                תבניות משמרות מהירות
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                {shiftTemplates.slice(0, 4).map((template: any) => (
                  <Button
                    key={template.id}
                    type="button"
                    onClick={() => onCreateFromTemplate(template)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 flex flex-col items-start"
                  >
                    <span className="font-medium">{template.name}</span>
                    <span className="text-gray-500">
                      {template.start_time} - {template.end_time}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};