import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Search, Plus, Users, Clock, MapPin } from 'lucide-react';
import { useShiftSchedule } from './schedule/useShiftSchedule';
import { ShiftScheduleView } from './schedule/ShiftScheduleView';
import { CopyPreviousScheduleDialog } from './schedule/components/CopyPreviousScheduleDialog';

export const ResponsiveShiftSchedule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  const {
    currentDate,
    shifts,
    employees,
    branches,
    pendingSubmissions,
    loading,
    error,
    navigateDate,
    updateShift,
    deleteShift,
    createShift,
    businessId,
    refetchShifts
  } = useShiftSchedule();

  // Filter shifts based on search and filters
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const matchesSearch = searchTerm === '' || 
        shift.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employees.find(emp => emp.id === shift.employee_id)?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employees.find(emp => emp.id === shift.employee_id)?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEmployee = selectedEmployee === 'all' || shift.employee_id === selectedEmployee;
      const matchesBranch = selectedBranch === 'all' || shift.branch_id === selectedBranch;
      const matchesStatus = selectedStatus === 'all' || shift.status === selectedStatus;

      return matchesSearch && matchesEmployee && matchesBranch && matchesStatus;
    });
  }, [shifts, searchTerm, selectedEmployee, selectedBranch, selectedStatus, employees]);

  const handleShiftClick = (shift: any) => {
    setSelectedShift(shift);
  };

  const handleAddShift = (date: Date) => {
    // Simple implementation - in real app this would open a dialog
    console.log('Add shift for date:', date);
  };

  const handleShiftUpdate = async (shiftId: string, updates: any) => {
    try {
      await updateShift(shiftId, updates);
      await refetchShifts();
    } catch (error) {
      console.error('Error updating shift:', error);
    }
  };

  const handleNavigateDate = (direction: -1 | 0 | 1) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7)); // Navigate by weeks
    navigateDate(newDate);
  };

  const handleWeekDeleted = () => {
    refetchShifts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען לוח משמרות...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center text-red-800">
            <h3 className="text-lg font-semibold mb-2">שגיאה בטעינת הנתונים</h3>
            <p className="mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              נסה שוב
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">לוח משמרות</h1>
            <p className="text-sm text-gray-600">
              {currentDate.toLocaleDateString('he-IL', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleNavigateDate(-1)}
          >
            שבוע קודם
          </Button>
          <Button
            variant="outline"
            onClick={() => handleNavigateDate(1)}
          >
            שבוע הבא
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCopyDialog(true)}
          >
            העתק לוח זמנים
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            סינון וחיפוש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חיפוש משמרות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="כל העובדים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העובדים</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="כל הסניפים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסניפים</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="כל הסטטוסים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="approved">מאושר</SelectItem>
                <SelectItem value="rejected">נדחה</SelectItem>
                <SelectItem value="completed">הושלם</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {filteredShifts.length} משמרות
              </Badge>
              {pendingSubmissions.length > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {pendingSubmissions.length} הגשות
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">עובדים פעילים</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">משמרות השבוע</p>
                <p className="text-2xl font-bold">{filteredShifts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סניפים פעילים</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule View */}
      <ShiftScheduleView
        shifts={filteredShifts}
        employees={employees}
        branches={branches}
        currentDate={currentDate}
        holidays={[]}
        shabbatTimes={[]}
        calendarEvents={[]}
        pendingSubmissions={pendingSubmissions}
        businessId={businessId}
        onShiftClick={handleShiftClick}
        onShiftUpdate={handleShiftUpdate}
        onAddShift={handleAddShift}
        onShiftDelete={deleteShift}
        onWeekDeleted={handleWeekDeleted}
      />

      {/* Copy Schedule Dialog */}
      <CopyPreviousScheduleDialog
        open={showCopyDialog}
        onOpenChange={setShowCopyDialog}
        onSuccess={() => {
          refetchShifts();
          setShowCopyDialog(false);
        }}
      />
    </div>
  );
};

export default ResponsiveShiftSchedule;
