import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmployeeCompatibleShifts } from '@/hooks/useEmployeeCompatibleShifts';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Star } from 'lucide-react';

export const EmployeeCompatibleShiftsView: React.FC = () => {
  const [token, setToken] = useState('');
  const [submittedToken, setSubmittedToken] = useState('');
  
  const { data: shiftsData, isLoading, error } = useEmployeeCompatibleShifts(submittedToken);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      setSubmittedToken(token.trim());
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getDayColor = (dayIndex: number) => {
    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200', 
      'bg-purple-50 border-purple-200',
      'bg-orange-50 border-orange-200',
      'bg-pink-50 border-pink-200',
      'bg-indigo-50 border-indigo-200',
      'bg-red-50 border-red-200'
    ];
    return colors[dayIndex] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            בדיקת משמרות תואמות לעובד
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTokenSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="הזן טוקן עובד..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!token.trim() || isLoading}>
              {isLoading ? 'טוען...' : 'בדוק משמרות'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>שגיאה: {error.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {shiftsData && (
        <div className="space-y-6">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                עובד: {shiftsData.tokenData.employee.first_name} {shiftsData.tokenData.employee.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">מספר עובד:</span> {shiftsData.tokenData.employee.employee_id}
                </div>
                <div>
                  <span className="font-medium">עסק:</span> {shiftsData.tokenData.employee.business.name}
                </div>
                <div>
                  <span className="font-medium">שבוע:</span> {shiftsData.tokenData.weekStart} - {shiftsData.tokenData.weekEnd}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">סיכום</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>משמרות רגילות תואמות: {shiftsData.totalCompatibleShifts}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span>משמרות מיוחדות: {shiftsData.totalSpecialShifts}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    הקצאות סניפים: {shiftsData.employeeAssignments.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shifts by Day */}
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(shiftsData.shiftsByDay).map(([dayName, dayData]: [string, any]) => (
              <Card key={dayName} className={`${getDayColor(dayData.dayIndex)}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{dayName}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {dayData.shifts.length} סה"כ
                      </Badge>
                      <Badge variant="default">
                        {dayData.compatibleShifts.length} תואמות
                      </Badge>
                      {dayData.autoSelectedShifts.length > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {dayData.autoSelectedShifts.length} נבחרו
                        </Badge>
                      )}
                      {dayData.specialShifts.length > 0 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {dayData.specialShifts.length} מיוחדות
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayData.shifts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">אין משמרות זמינות ביום זה</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Auto-selected shifts */}
                      {dayData.autoSelectedShifts.length > 0 && (
                        <div>
                          <h4 className="font-medium text-green-700 mb-2">משמרות נבחרות אוטומטית:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dayData.autoSelectedShifts.map((shift: any) => (
                              <div key={shift.id} className="border rounded-lg p-3 bg-green-50 border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">{shift.shift_name}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {shift.shift_type}
                                  </Badge>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{shift.branch.name}</span>
                                  </div>
                                  <div className="text-xs text-green-600">
                                    {shift.reason}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other compatible shifts */}
                      {dayData.compatibleShifts.length > dayData.autoSelectedShifts.length && (
                        <div>
                          <h4 className="font-medium text-blue-700 mb-2">משמרות תואמות נוספות:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dayData.compatibleShifts
                              .filter((shift: any) => !dayData.autoSelectedShifts.find((auto: any) => auto.id === shift.id))
                              .map((shift: any) => (
                              <div key={shift.id} className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{shift.shift_name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {shift.shift_type}
                                  </Badge>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{shift.branch.name}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special shifts */}
                      {dayData.specialShifts.length > 0 && (
                        <div>
                          <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            משמרות מיוחדות:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dayData.specialShifts.map((shift: any) => (
                              <div key={shift.id} className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium">{shift.shift_name}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs bg-yellow-100">
                                    {shift.shift_type}
                                  </Badge>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{shift.branch.name}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Non-compatible shifts */}
                      {dayData.shifts.length > dayData.compatibleShifts.length && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            הצג משמרות לא תואמות ({dayData.shifts.length - dayData.compatibleShifts.length})
                          </summary>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dayData.shifts
                              .filter((shift: any) => !dayData.compatibleShifts.find((comp: any) => comp.id === shift.id))
                              .map((shift: any) => (
                              <div key={shift.id} className="border rounded-lg p-3 bg-gray-50 border-gray-200 opacity-60">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{shift.shift_name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    לא תואם
                                  </Badge>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{shift.branch.name}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
