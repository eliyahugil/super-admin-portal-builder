
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';
import { WeeklyScheduleView } from './schedule/WeeklyScheduleView';
import { MonthlyScheduleView } from './schedule/MonthlyScheduleView';
import { ShiftScheduleFilters } from './schedule/ShiftScheduleFilters';
import { CreateShiftDialog } from './schedule/CreateShiftDialog';
import { ShiftDetailsDialog } from './schedule/ShiftDetailsDialog';
import { useShiftSchedule } from './schedule/useShiftSchedule';
import type { ScheduleView, ShiftScheduleData } from './schedule/types';

export const ShiftSchedule: React.FC = () => {
  const [view, setView] = useState<ScheduleView>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftScheduleData | null>(null);
  
  const {
    currentDate,
    shifts,
    employees,
    branches,
    loading,
    navigateDate,
    updateShift,
    deleteShift,
    createShift,
    filters,
    updateFilters
  } = useShiftSchedule();

  const formatDateRange = () => {
    if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('he-IL')} - ${endOfWeek.toLocaleDateString('he-IL')}`;
    } else {
      return currentDate.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
    }
  };

  const handleShiftClick = (shift: ShiftScheduleData) => {
    setSelectedShift(shift);
  };

  const handleShiftUpdate = async (shiftId: string, updates: Partial<ShiftScheduleData>) => {
    await updateShift(shiftId, updates);
    setSelectedShift(null);
  };

  const handleShiftDelete = async (shiftId: string) => {
    await deleteShift(shiftId);
    setSelectedShift(null);
  };

  const getScheduleStats = () => {
    const today = new Date();
    const todayShifts = shifts.filter(shift => 
      new Date(shift.shift_date).toDateString() === today.toDateString()
    );
    
    const totalEmployees = new Set(shifts.map(shift => shift.employee_id)).size;
    const totalHours = shifts.reduce((sum, shift) => {
      const start = new Date(`2000-01-01T${shift.start_time}`);
      const end = new Date(`2000-01-01T${shift.end_time}`);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    return {
      todayShifts: todayShifts.length,
      totalEmployees,
      totalHours: Math.round(totalHours)
    };
  };

  const stats = getScheduleStats();

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">לוח משמרות</h1>
          <p className="text-gray-600 mt-1">ניהול וצפייה בלוח הזמנים השבועי והחודשי</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            מסננים
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            יצוא
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            משמרת חדשה
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">משמרות היום</p>
                <p className="text-2xl font-bold">{stats.todayShifts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">עובדים פעילים</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סה"כ שעות</p>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <ShiftScheduleFilters
          filters={filters}
          onFiltersChange={updateFilters}
          employees={employees}
          branches={branches}
        />
      )}

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl">{formatDateRange()}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate(-1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate(0)}
                >
                  היום
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate(1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : view === 'week' ? (
            <WeeklyScheduleView
              shifts={shifts}
              employees={employees}
              currentDate={currentDate}
              onShiftClick={handleShiftClick}
              onShiftUpdate={updateShift}
            />
          ) : (
            <MonthlyScheduleView
              shifts={shifts}
              employees={employees}
              currentDate={currentDate}
              onShiftClick={handleShiftClick}
              onShiftUpdate={updateShift}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateShiftDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={createShift}
          employees={employees}
          branches={branches}
        />
      )}
      
      {selectedShift && (
        <ShiftDetailsDialog
          shift={selectedShift}
          employees={employees}
          branches={branches}
          onClose={() => setSelectedShift(null)}
          onUpdate={handleShiftUpdate}
          onDelete={handleShiftDelete}
        />
      )}
    </div>
  );
};
