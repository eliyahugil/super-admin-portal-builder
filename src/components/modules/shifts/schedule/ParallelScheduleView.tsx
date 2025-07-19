import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, CalendarDays, LayoutGrid, Maximize2, Minimize2 } from 'lucide-react';
import { ShiftDisplayCard } from './components/ShiftDisplayCard';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ShiftScheduleViewProps, ShiftScheduleData } from './types';

interface CompactViewProps extends ShiftScheduleViewProps {
  viewType: 'week' | 'month';
  onMaximize?: () => void;
}

// תצוגה קומפקטית למשמרות
const CompactShiftView: React.FC<CompactViewProps> = ({
  shifts,
  employees,
  branches,
  currentDate,
  viewType,
  onShiftClick,
  onShiftUpdate,
  onShiftDelete,
  isSelectionMode,
  selectedShifts,
  onShiftSelection,
  onMaximize
}) => {
  const isMobile = useIsMobile();

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא מוקצה';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasShiftConflict = (shift: ShiftScheduleData) => false; // מפושט לעכשיו
  const isShiftSelected = (shift: ShiftScheduleData) => selectedShifts?.some(s => s.id === shift.id) || false;

  // קבוצת משמרות לפי תאריך
  const groupedShifts = shifts.reduce((acc, shift) => {
    const date = shift.shift_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, ShiftScheduleData[]>);

  const getTimeSlot = (startTime: string): 'morning' | 'evening' | 'night' => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 22) return 'evening';
    return 'night';
  };

  return (
    <div className="h-full flex flex-col">
      {/* כותרת עם פעולות */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="text-sm font-medium">
          {viewType === 'week' ? 'תצוגה שבועית' : 'תצוגה חודשית'}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {shifts.length} משמרות
          </Badge>
          {onMaximize && (
            <Button variant="ghost" size="sm" onClick={onMaximize} className="h-6 w-6 p-0">
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* תוכן המשמרות */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {Object.entries(groupedShifts)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(0, viewType === 'week' ? 7 : 30) // הגבלת כמות
            .map(([date, dayShifts]) => (
              <div key={date} className="border rounded-lg p-2 bg-white">
                {/* כותרת התאריך */}
                <div className="text-xs font-medium text-gray-600 mb-2 pb-1 border-b">
                  {new Date(date).toLocaleDateString('he-IL', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                  <span className="mr-2 text-blue-600">({dayShifts.length})</span>
                </div>

                {/* רשימת המשמרות */}
                <div className="grid gap-1">
                  {dayShifts.slice(0, 4).map(shift => ( // מקסימום 4 משמרות לתאריך
                    <div
                      key={shift.id}
                      className={`p-2 rounded text-xs border transition-colors cursor-pointer ${
                        shift.employee_id 
                          ? shift.status === 'approved'
                            ? 'bg-green-50 border-green-200 hover:bg-green-100'
                            : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => onShiftClick?.(shift)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {shift.start_time} - {shift.end_time}
                          </span>
                          {shift.branch_name && (
                            <span className="text-blue-600">• {shift.branch_name}</span>
                          )}
                        </div>
                        <div className="text-right">
                          {shift.employee_id ? (
                            <span className={`px-1 py-0.5 rounded text-[10px] ${
                              shift.status === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {getEmployeeName(shift.employee_id).split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-orange-600 text-[10px]">פנוי</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {dayShifts.length > 4 && (
                    <div className="text-center text-xs text-gray-500 py-1">
                      +{dayShifts.length - 4} משמרות נוספות
                    </div>
                  )}
                </div>
              </div>
            ))}

          {Object.keys(groupedShifts).length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              אין משמרות להצגה
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export const ParallelScheduleView: React.FC<ShiftScheduleViewProps> = (props) => {
  const [selectedViews, setSelectedViews] = useState<string[]>(['week', 'month']);
  const [maximizedView, setMaximizedView] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const availableViews = [
    { id: 'week', name: 'שבועי', icon: Calendar },
    { id: 'month', name: 'חודשי', icon: CalendarDays },
  ];

  const toggleView = (viewId: string) => {
    setSelectedViews(prev => 
      prev.includes(viewId) 
        ? prev.filter(id => id !== viewId)
        : [...prev, viewId]
    );
  };

  const getGridCols = () => {
    if (maximizedView) return 'grid-cols-1';
    const count = selectedViews.length;
    if (isMobile || count === 1) return 'grid-cols-1';
    return count === 2 ? 'grid-cols-2' : 'grid-cols-3';
  };

  return (
    <div className="flex flex-col space-y-4 h-full overflow-hidden bg-white" dir="rtl">
      {/* בקרות בחירת תצוגה */}
      {!maximizedView && (
        <Card className="flex-shrink-0 bg-white border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">תצוגה מקבילה</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {selectedViews.length} תצוגות פעילות
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {availableViews.map(view => {
                const Icon = view.icon;
                const isSelected = selectedViews.includes(view.id);
                return (
                  <Button
                    key={view.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleView(view.id)}
                    className={`transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 ml-1" />
                    {view.name}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* תצוגות מקביליות או ממוקסמת */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white">
        {maximizedView ? (
          <Card className="h-full flex flex-col bg-white border shadow-sm">
            <CardHeader className="pb-2 flex-shrink-0 bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {availableViews.find(v => v.id === maximizedView)?.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaximizedView(null)}
                  className="h-8 w-8 p-0"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden p-0 bg-white">
              <CompactShiftView
                {...props}
                viewType={maximizedView as 'week' | 'month'}
              />
            </CardContent>
          </Card>
        ) : selectedViews.length > 0 ? (
          <div className={`grid ${getGridCols()} gap-4 h-full bg-white`}>
            {selectedViews.map(viewId => {
              const view = availableViews.find(v => v.id === viewId);
              if (!view) return null;

              const Icon = view.icon;

              return (
                <Card key={viewId} className="flex flex-col min-h-0 overflow-hidden bg-white border shadow-sm">
                  <CardHeader className="pb-2 flex-shrink-0 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-sm">{view.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMaximizedView(viewId)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleView(viewId)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 overflow-hidden p-0 bg-white">
                    <CompactShiftView
                      {...props}
                      viewType={viewId as 'week' | 'month'}
                      onMaximize={() => setMaximizedView(viewId)}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="h-full flex items-center justify-center bg-white border shadow-sm">
            <div className="text-center py-8">
              <LayoutGrid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">בחר תצוגות להצגה מקבילה</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};