import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklyScheduleView } from './WeeklyScheduleView';
import { MonthlyScheduleView } from './MonthlyScheduleView';
import { Calendar, Grid3X3, CalendarDays, LayoutGrid } from 'lucide-react';
import type { ShiftScheduleViewProps } from './types';

export const ParallelScheduleView: React.FC<ShiftScheduleViewProps> = (props) => {
  const [selectedViews, setSelectedViews] = useState<string[]>(['week', 'month']);
  
  const availableViews = [
    { id: 'week', name: 'שבועי', icon: Calendar, component: WeeklyScheduleView },
    { id: 'month', name: 'חודשי', icon: CalendarDays, component: MonthlyScheduleView },
  ];

  const toggleView = (viewId: string) => {
    setSelectedViews(prev => 
      prev.includes(viewId) 
        ? prev.filter(id => id !== viewId)
        : [...prev, viewId]
    );
  };

  const getGridCols = () => {
    const count = selectedViews.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
  };

  return (
    <div className="flex flex-col space-y-4 h-full overflow-hidden" dir="rtl">
      {/* View Selection Controls */}
      <Card>
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
          <p className="text-sm text-gray-600">
            בחר אילו לוחות תרצה לראות במקביל
          </p>
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
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <Icon className="h-4 w-4 ml-1" />
                  {view.name}
                </Button>
              );
            })}
          </div>
          {selectedViews.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              בחר לפחות תצוגה אחת כדי להתחיל
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parallel Views Grid */}
      {selectedViews.length > 0 && (
        <div className={`grid ${getGridCols()} gap-4 flex-1 min-h-0 overflow-hidden`}>
          {selectedViews.map(viewId => {
            const view = availableViews.find(v => v.id === viewId);
            if (!view) return null;

            const ViewComponent = view.component;
            const Icon = view.icon;

            return (
              <Card key={viewId} className="flex flex-col min-h-0 overflow-hidden">
                <CardHeader className="pb-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-base">{view.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleView(viewId)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
                  <div className="h-full overflow-auto">
                    <ViewComponent {...props} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Help Text */}
      {selectedViews.length > 0 && (
        <div className="text-xs text-gray-500 text-center py-2 border-t">
          💡 טיפ: תוכל לסנן כל תצוגה בנפרד בעזרת הפילטרים העליונים
        </div>
      )}
    </div>
  );
};