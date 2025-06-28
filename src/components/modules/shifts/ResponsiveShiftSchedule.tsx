
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
  Download,
  Copy,
  Menu
} from 'lucide-react';
import { WeeklyScheduleView } from './schedule/WeeklyScheduleView';
import { MonthlyScheduleView } from './schedule/MonthlyScheduleView';
import { ShiftScheduleFilters } from './schedule/ShiftScheduleFilters';
import { CreateShiftDialog } from './schedule/CreateShiftDialog';
import { ShiftDetailsDialog } from './schedule/ShiftDetailsDialog';
import { BulkShiftCreator } from './schedule/BulkShiftCreator';
import { useShiftSchedule } from './schedule/useShiftSchedule';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ScheduleView, ShiftScheduleData } from './schedule/types';

export const ResponsiveShiftSchedule: React.FC = () => {
  const isMobile = useIsMobile();
  const [view, setView] = useState<ScheduleView>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftScheduleData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const handleBulkCreate = async (shifts: Omit<ShiftScheduleData, 'id' | 'created_at'>[]) => {
    for (const shift of shifts) {
      await createShift(shift);
    }
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
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 lg:space-y-6 h-full flex flex-col`} dir="rtl">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>לוח משמרות</h1>
            <p className="text-gray-600 mt-1">ניהול וצפייה בלוח הזמנים השבועי והחודשי</p>
          </div>
          
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Mobile Actions Menu */}
        {isMobile && mobileMenuOpen && (
          <Card className="p-4 space-y-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => {
                setShowFilters(!showFilters);
                setMobileMenuOpen(false);
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              מסננים
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              יצוא
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setShowBulkCreator(true);
                setMobileMenuOpen(false);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              יצירה בכמות
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => {
                setShowCreateDialog(true);
                setMobileMenuOpen(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              משמרת חדשה
            </Button>
          </Card>
        )}

        {/* Desktop Actions */}
        {!isMobile && (
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
            <Button
              variant="outline"
              onClick={() => setShowBulkCreator(true)}
            >
              <Copy className="mr-2 h-4 w-4" />
              יצירה בכמות
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              משמרת חדשה
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4`}>
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

      {/* Calendar Navigation & Content */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3">
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
              <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>{formatDateRange()}</CardTitle>
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
        
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
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

      {showBulkCreator && (
        <BulkShiftCreator
          isOpen={showBulkCreator}
          onClose={() => setShowBulkCreator(false)}
          onSubmit={handleBulkCreate}
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
