
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit, Trash2, Save, X } from 'lucide-react';
import type { ShiftScheduleData, EmployeeData, BranchData } from './types';

interface ShiftDetailsDialogProps {
  shift: ShiftScheduleData;
  employees: EmployeeData[];
  branches: BranchData[];
  onClose: () => void;
  onUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onDelete: (shiftId: string) => void;
}

export const ShiftDetailsDialog: React.FC<ShiftDetailsDialogProps> = ({
  shift,
  employees,
  branches,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: shift.employee_id,
    shift_date: shift.shift_date,
    start_time: shift.start_time,
    end_time: shift.end_time,
    status: shift.status,
    branch_id: shift.branch_id || '',
    role_preference: shift.role_preference || '',
    notes: shift.notes || ''
  });

  const handleSave = () => {
    const branch = branches.find(b => b.id === formData.branch_id);
    onUpdate(shift.id, {
      ...formData,
      branch_name: branch?.name
    });
    setIsEditing(false);
  };

  const handleCopy = () => {
    // TODO: Implement copy functionality
    console.log('Copy shift:', shift);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא משוייך';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'מאושר';
      case 'pending': return 'ממתין';
      case 'rejected': return 'נדחה';
      case 'completed': return 'הושלם';
      default: return status;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>פרטי משמרת</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                העתק
              </Button>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  ערוך
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    ביטול
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    שמור
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">עובד</Label>
                  <p className="text-lg font-semibold">{getEmployeeName(shift.employee_id)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">סטטוס</Label>
                  <Badge className={`${getStatusColor(shift.status)} mt-1`}>
                    {getStatusText(shift.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">תאריך</Label>
                  <p className="text-lg">{new Date(shift.shift_date).toLocaleDateString('he-IL')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">שעת התחלה</Label>
                  <p className="text-lg">{shift.start_time.slice(0, 5)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">שעת סיום</Label>
                  <p className="text-lg">{shift.end_time.slice(0, 5)}</p>
                </div>
              </div>

              {shift.branch_name && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">סניף</Label>
                  <p className="text-lg">{shift.branch_name}</p>
                </div>
              )}

              {shift.role_preference && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">תפקיד</Label>
                  <p className="text-lg">{shift.role_preference}</p>
                </div>
              )}

              {shift.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">הערות</Label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{shift.notes}</p>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">עובד</Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(value) => setFormData({...formData, employee_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר עובד" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">סטטוס</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="approved">מאושר</SelectItem>
                      <SelectItem value="rejected">נדחה</SelectItem>
                      <SelectItem value="completed">הושלם</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">תאריך</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.shift_date}
                    onChange={(e) => setFormData({...formData, shift_date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">שעת התחלה</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">שעת סיום</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">סניף</Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={(value) => setFormData({...formData, branch_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סניף" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">תפקיד</Label>
                  <Select
                    value={formData.role_preference}
                    onValueChange={(value) => setFormData({...formData, role_preference: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תפקיד" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashier">קופאי</SelectItem>
                      <SelectItem value="sales">מכירות</SelectItem>
                      <SelectItem value="manager">מנהל</SelectItem>
                      <SelectItem value="security">אבטחה</SelectItem>
                      <SelectItem value="cleaner">ניקיון</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="הערות נוספות..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('האם אתה בטוח שברצונך למחוק את המשמרת?')) {
                  onDelete(shift.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              מחק משמרת
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              סגור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
