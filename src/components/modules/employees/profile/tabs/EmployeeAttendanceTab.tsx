import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { Employee } from '@/types/supabase';

interface EmployeeAttendanceTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

interface AttendanceRecord {
  id: string;
  action: 'check_in' | 'check_out';
  recorded_at: string;
  branch_id: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy?: number;
  is_valid_location?: boolean;
  branch?: {
    id: string;
    name: string;
  };
}

export const EmployeeAttendanceTab: React.FC<EmployeeAttendanceTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  const { user } = useAuth();
  const { businessId } = useCurrentBusiness();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [newRecord, setNewRecord] = useState({
    action: 'check_in' as const,
    date: '',
    time: '',
    branch_id: '',
    notes: ''
  });

  // Fetch attendance records
  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['attendance-records', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          branch:branches(id, name)
        `)
        .eq('employee_id', employeeId)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!employeeId,
  });

  // Fetch branches for selection
  const { data: branches } = useQuery({
    queryKey: ['branches', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Add attendance record mutation
  const addRecordMutation = useMutation({
    mutationFn: async (recordData: typeof newRecord) => {
      if (!user?.id || !businessId) {
        throw new Error('חובה להיות מחובר למערכת');
      }

      const recordedAt = new Date(`${recordData.date}T${recordData.time}`).toISOString();

      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: employeeId,
          branch_id: recordData.branch_id,
          action: recordData.action,
          recorded_at: recordedAt,
          notes: recordData.notes || null,
        })
        .select(`
          *,
          branch:branches(id, name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records', employeeId] });
      setNewRecord({
        action: 'check_in',
        date: '',
        time: '',
        branch_id: '',
        notes: ''
      });
      setIsAddDialogOpen(false);
      toast.success('רישום נוכחות נוסף בהצלחה');
    },
    onError: (error) => {
      console.error('Error adding attendance record:', error);
      toast.error('שגיאה בהוספת רישום נוכחות');
    },
  });

  // Delete attendance record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records', employeeId] });
      toast.success('רישום נוכחות נמחק בהצלחה');
    },
    onError: (error) => {
      console.error('Error deleting attendance record:', error);
      toast.error('שגיאה במחיקת רישום נוכחות');
    },
  });

  const handleAddRecord = () => {
    if (!newRecord.date || !newRecord.time || !newRecord.branch_id) {
      toast.error('יש למלא את כל השדות הנדרשים');
      return;
    }
    addRecordMutation.mutate(newRecord);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את רישום הנוכחות?')) {
      deleteRecordMutation.mutate(recordId);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'check_in': return 'כניסה';
      case 'check_out': return 'יציאה';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'check_in': return 'bg-green-100 text-green-800';
      case 'check_out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const actionTypes = [
    { value: 'check_in', label: 'כניסה' },
    { value: 'check_out', label: 'יציאה' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            נוכחות ושעות עבודה
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                הוסף רישום ידני
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>הוספת רישום נוכחות ידני</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="action-type">סוג פעולה</Label>
                  <Select value={newRecord.action} onValueChange={(value: any) => setNewRecord({...newRecord, action: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">תאריך</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">שעה</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newRecord.time}
                    onChange={(e) => setNewRecord({...newRecord, time: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="branch">סניף</Label>
                  <Select value={newRecord.branch_id} onValueChange={(value) => setNewRecord({...newRecord, branch_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סניף" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes">הערות (אופציונלי)</Label>
                  <Textarea
                    id="notes"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    placeholder="הערות נוספות..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddRecord} 
                    disabled={!newRecord.date || !newRecord.time || !newRecord.branch_id || addRecordMutation.isPending}
                  >
                    הוסף רישום
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    ביטול
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : !attendanceRecords || attendanceRecords.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין רישומי נוכחות</h3>
            <p className="text-gray-500">לא נמצאו רישומי נוכחות עבור עובד זה</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceRecords.map((record) => (
              <div key={record.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge className={getActionColor(record.action)}>
                      {getActionLabel(record.action)}
                    </Badge>
                    {record.branch && (
                      <span className="text-sm text-gray-600">
                        {record.branch.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {format(new Date(record.recorded_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {record.latitude && record.longitude && (
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />
                    GPS: {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                    {record.is_valid_location !== null && (
                      <span className={record.is_valid_location ? 'text-green-600' : 'text-red-600'}>
                        {record.is_valid_location ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                )}
                
                {record.notes && (
                  <p className="text-sm text-gray-700">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};