
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DynamicSelect } from '@/components/ui/DynamicSelect';
import type { Employee } from '@/types/employee';

interface EmployeeBranchAssignmentsTabProps {
  employee: Employee;
  employeeId: string;
}

export const EmployeeBranchAssignmentsTab: React.FC<EmployeeBranchAssignmentsTabProps> = ({
  employee,
  employeeId
}) => {
  const [assignments, setAssignments] = useState(employee.branch_assignments || []);
  const [branches, setBranches] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [newAssignment, setNewAssignment] = useState({
    branch_id: '',
    role_name: '',
    priority_order: 1,
    max_weekly_hours: '',
    is_active: true,
    shift_types: ['morning', 'evening'] as string[],
    available_days: [0, 1, 2, 3, 4, 5, 6] as number[]
  });

  // Fetch branches and roles for the business
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch branches
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .select('*')
          .eq('business_id', employee.business_id)
          .eq('is_active', true);

        if (branchError) throw branchError;
        setBranches(branchData || []);

        // Fetch roles
        const { data: roleData, error: roleError } = await supabase
          .from('shift_roles')
          .select('*')
          .eq('business_id', employee.business_id)
          .eq('is_active', true);

        if (roleError) throw roleError;
        setRoles(roleData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [employee.business_id]);

  // Function to add a new role
  const handleAddNewRole = async (newRole: { value: string; label: string }): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('shift_roles')
        .insert({
          business_id: employee.business_id,
          name: newRole.label,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Update the roles list
      setRoles([...roles, data]);
      return true;
    } catch (error) {
      console.error('Error adding new role:', error);
      toast.error('שגיאה בהוספת תפקיד חדש');
      return false;
    }
  };

  const handleAddAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_branch_assignments')
        .insert({
          employee_id: employeeId,
          branch_id: newAssignment.branch_id,
          role_name: newAssignment.role_name,
          priority_order: newAssignment.priority_order,
          max_weekly_hours: newAssignment.max_weekly_hours ? parseInt(newAssignment.max_weekly_hours) : null,
          is_active: newAssignment.is_active,
          shift_types: newAssignment.shift_types,
          available_days: newAssignment.available_days
        })
        .select(`
          *,
          branch:branches(name)
        `)
        .single();

      if (error) throw error;

      setAssignments([...assignments, data]);
      setNewAssignment({
        branch_id: '',
        role_name: '',
        priority_order: 1,
        max_weekly_hours: '',
        is_active: true,
        shift_types: ['morning', 'evening'],
        available_days: [0, 1, 2, 3, 4, 5, 6]
      });
      setIsAddDialogOpen(false);
      toast.success('שיוך לסניף נוסף בהצלחה');
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast.error('שגיאה בהוספת שיוך לסניף');
    }
  };

  const handleEditAssignment = async () => {
    if (!editingAssignment) return;

    try {
      const { data, error } = await supabase
        .from('employee_branch_assignments')
        .update({
          role_name: editingAssignment.role_name,
          priority_order: editingAssignment.priority_order,
          max_weekly_hours: editingAssignment.max_weekly_hours ? parseInt(editingAssignment.max_weekly_hours) : null,
          is_active: editingAssignment.is_active,
          shift_types: editingAssignment.shift_types,
          available_days: editingAssignment.available_days
        })
        .eq('id', editingAssignment.id)
        .select(`
          *,
          branch:branches(name)
        `)
        .single();

      if (error) throw error;

      setAssignments(assignments.map(a => a.id === editingAssignment.id ? data : a));
      setEditingAssignment(null);
      toast.success('שיוך עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('שגיאה בעדכון שיוך');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('employee_branch_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(assignments.filter(a => a.id !== assignmentId));
      toast.success('שיוך נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('שגיאה במחיקת שיוך');
    }
  };

  const availableBranches = branches.filter(branch => 
    !assignments.some(assignment => assignment.branch_id === branch.id && assignment.is_active)
  );

  const getShiftTypeLabel = (shiftTypes: string[]) => {
    if (!shiftTypes || shiftTypes.length === 0) return 'כל הסוגים';
    return shiftTypes.map(type => type === 'morning' ? 'בוקר' : 'ערב').join(', ');
  };

  const getDayLabels = (availableDays: number[]) => {
    if (!availableDays || availableDays.length === 0) return 'כל הימים';
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return availableDays.map(day => dayNames[day]).join(', ');
  };

  const handleShiftTypeChange = (shiftType: string, checked: boolean) => {
    if (checked) {
      setNewAssignment({
        ...newAssignment,
        shift_types: [...newAssignment.shift_types, shiftType]
      });
    } else {
      setNewAssignment({
        ...newAssignment,
        shift_types: newAssignment.shift_types.filter(type => type !== shiftType)
      });
    }
  };

  const handleDayChange = (day: number, checked: boolean) => {
    if (checked) {
      setNewAssignment({
        ...newAssignment,
        available_days: [...newAssignment.available_days, day].sort()
      });
    } else {
      setNewAssignment({
        ...newAssignment,
        available_days: newAssignment.available_days.filter(d => d !== day)
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            שיוך לסניפים
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={availableBranches.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                הוסף שיוך
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>הוספת שיוך לסניף</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="branch">סניף</Label>
                  <Select value={newAssignment.branch_id} onValueChange={(value) => setNewAssignment({...newAssignment, branch_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סניף" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBranches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">תפקיד</Label>
                  <DynamicSelect
                    value={newAssignment.role_name}
                    onValueChange={(value) => setNewAssignment({...newAssignment, role_name: value})}
                    options={roles.map(role => ({ 
                      value: role.name, 
                      label: role.name, 
                      id: role.id 
                    }))}
                    placeholder="בחר תפקיד..."
                    onAddNew={handleAddNewRole}
                    addNewText="➕ הוסף תפקיד חדש"
                    addNewDialogTitle="הוספת תפקיד חדש"
                    addNewDialogLabel="שם התפקיד"
                    addNewPlaceholder="הכנס שם תפקיד"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">סדר עדיפות</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    value={newAssignment.priority_order}
                    onChange={(e) => setNewAssignment({...newAssignment, priority_order: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="max-hours">מקסימום שעות שבועי (אופציונלי)</Label>
                  <Input
                    id="max-hours"
                    type="number"
                    min="1"
                    value={newAssignment.max_weekly_hours}
                    onChange={(e) => setNewAssignment({...newAssignment, max_weekly_hours: e.target.value})}
                    placeholder="הכנס מספר שעות..."
                  />
                </div>
                <div>
                  <Label>סוגי משמרות</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="morning"
                        checked={newAssignment.shift_types.includes('morning')}
                        onCheckedChange={(checked) => handleShiftTypeChange('morning', checked as boolean)}
                      />
                      <Label htmlFor="morning">בוקר</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="evening"
                        checked={newAssignment.shift_types.includes('evening')}
                        onCheckedChange={(checked) => handleShiftTypeChange('evening', checked as boolean)}
                      />
                      <Label htmlFor="evening">ערב</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>ימים זמינים</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${index}`}
                          checked={newAssignment.available_days.includes(index)}
                          onCheckedChange={(checked) => handleDayChange(index, checked as boolean)}
                        />
                        <Label htmlFor={`day-${index}`} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={newAssignment.is_active}
                    onCheckedChange={(checked) => setNewAssignment({...newAssignment, is_active: checked as boolean})}
                  />
                  <Label htmlFor="is-active">שיוך פעיל</Label>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddAssignment} 
                    disabled={!newAssignment.branch_id || !newAssignment.role_name.trim() || newAssignment.shift_types.length === 0 || newAssignment.available_days.length === 0}
                  >
                    הוסף שיוך
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
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{assignment.branch?.name || 'סניף לא ידוע'}</h4>
                  <Badge variant={assignment.is_active ? "default" : "secondary"}>
                    {assignment.is_active ? "פעיל" : "לא פעיל"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">תפקיד: {assignment.role_name}</p>
                <p className="text-sm text-gray-500">עדיפות: {assignment.priority_order}</p>
                {assignment.max_weekly_hours && (
                  <p className="text-sm text-gray-500">מקסימום שעות: {assignment.max_weekly_hours}</p>
                )}
                <p className="text-xs text-gray-400">משמרות: {getShiftTypeLabel(assignment.shift_types)}</p>
                <p className="text-xs text-gray-400">ימים: {getDayLabels(assignment.available_days)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingAssignment({
                    ...assignment,
                    max_weekly_hours: assignment.max_weekly_hours?.toString() || '',
                    shift_types: assignment.shift_types || ['morning', 'evening'],
                    available_days: assignment.available_days || [0, 1, 2, 3, 4, 5, 6]
                  })}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAssignment(assignment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין שיוכים לסניפים</h3>
              <p className="text-gray-500">לא נוספו שיוכים לסניפים עבור עובד זה</p>
            </div>
          )}
        </div>

        {/* Edit Assignment Dialog */}
        <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>עריכת שיוך לסניף</DialogTitle>
            </DialogHeader>
            {editingAssignment && (
              <div className="space-y-4">
                <div>
                  <Label>סניף</Label>
                  <p className="font-medium text-gray-900">
                    {editingAssignment.branch?.name || 'סניף לא ידוע'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-role">תפקיד</Label>
                  <DynamicSelect
                    value={editingAssignment.role_name}
                    onValueChange={(value) => setEditingAssignment({...editingAssignment, role_name: value})}
                    options={roles.map(role => ({ 
                      value: role.name, 
                      label: role.name, 
                      id: role.id 
                    }))}
                    placeholder="בחר תפקיד..."
                    onAddNew={handleAddNewRole}
                    addNewText="➕ הוסף תפקיד חדש"
                    addNewDialogTitle="הוספת תפקיד חדש"
                    addNewDialogLabel="שם התפקיד"
                    addNewPlaceholder="הכנס שם תפקיד"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">סדר עדיפות</Label>
                  <Input
                    id="edit-priority"
                    type="number"
                    min="1"
                    value={editingAssignment.priority_order}
                    onChange={(e) => setEditingAssignment({...editingAssignment, priority_order: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-max-hours">מקסימום שעות שבועי (אופציונלי)</Label>
                  <Input
                    id="edit-max-hours"
                    type="number"
                    min="1"
                    value={editingAssignment.max_weekly_hours}
                    onChange={(e) => setEditingAssignment({...editingAssignment, max_weekly_hours: e.target.value})}
                  />
                </div>
                <div>
                  <Label>סוגי משמרות</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-morning"
                        checked={editingAssignment.shift_types?.includes('morning')}
                        onCheckedChange={(checked) => {
                          const shiftTypes = checked 
                            ? [...(editingAssignment.shift_types || []), 'morning']
                            : (editingAssignment.shift_types || []).filter(type => type !== 'morning');
                          setEditingAssignment({...editingAssignment, shift_types: shiftTypes});
                        }}
                      />
                      <Label htmlFor="edit-morning">בוקר</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-evening"
                        checked={editingAssignment.shift_types?.includes('evening')}
                        onCheckedChange={(checked) => {
                          const shiftTypes = checked 
                            ? [...(editingAssignment.shift_types || []), 'evening']
                            : (editingAssignment.shift_types || []).filter(type => type !== 'evening');
                          setEditingAssignment({...editingAssignment, shift_types: shiftTypes});
                        }}
                      />
                      <Label htmlFor="edit-evening">ערב</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>ימים זמינים</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-day-${index}`}
                          checked={editingAssignment.available_days?.includes(index)}
                          onCheckedChange={(checked) => {
                            const availableDays = checked 
                              ? [...(editingAssignment.available_days || []), index].sort()
                              : (editingAssignment.available_days || []).filter(d => d !== index);
                            setEditingAssignment({...editingAssignment, available_days: availableDays});
                          }}
                        />
                        <Label htmlFor={`edit-day-${index}`} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is-active"
                    checked={editingAssignment.is_active}
                    onCheckedChange={(checked) => setEditingAssignment({...editingAssignment, is_active: checked as boolean})}
                  />
                  <Label htmlFor="edit-is-active">שיוך פעיל</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditAssignment}>
                    שמור שינויים
                  </Button>
                  <Button variant="outline" onClick={() => setEditingAssignment(null)}>
                    ביטול
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
