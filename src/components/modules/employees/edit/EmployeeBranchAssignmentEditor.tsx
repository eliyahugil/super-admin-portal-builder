import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Plus, Edit, Trash2, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBranchesData } from '@/hooks/useBranchesData';

interface BranchAssignment {
  id: string;
  branch_id: string;
  role_name: string;
  max_weekly_hours: number | null;
  priority_order: number;
  shift_types: string[] | null;
  available_days: number[] | null;
  is_active: boolean;
  branch?: { name: string };
}

interface EmployeeBranchAssignmentEditorProps {
  employeeId: string;
  businessId?: string;
}

export const EmployeeBranchAssignmentEditor: React.FC<EmployeeBranchAssignmentEditorProps> = ({
  employeeId,
  businessId
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state for new assignment
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number>(40);
  const [priorityOrder, setPriorityOrder] = useState<number>(1);
  const [shiftTypes, setShiftTypes] = useState<string[]>(['morning', 'evening']);
  const [availableDays, setAvailableDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [existingRoles, setExistingRoles] = useState<string[]>([]);

  // Get branches
  const { data: branches = [] } = useBranchesData(businessId);

  // Get existing assignments
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['employee-branch-assignments', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_branch_assignments')
        .select(`
          *,
          branch:branches(name)
        `)
        .eq('employee_id', employeeId)
        .order('priority_order');

      if (error) throw error;
      return data as BranchAssignment[];
    },
    enabled: !!employeeId,
  });

  // Fetch existing roles
  useEffect(() => {
    const fetchExistingRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_branch_assignments')
          .select('role_name')
          .not('role_name', 'is', null);

        if (error) throw error;

        const uniqueRoles = [...new Set(
          data
            .map(item => item.role_name?.trim())
            .filter(role => role && role.length > 0)
        )];

        setExistingRoles(uniqueRoles);
      } catch (error) {
        console.error('Error fetching existing roles:', error);
        setExistingRoles(['קופאי', 'מכירות', 'מנהל', 'אבטחה', 'ניקיון', 'טבח', 'מלצר', 'נהג']);
      }
    };

    fetchExistingRoles();
  }, []);

  // Reset form
  const resetForm = () => {
    setSelectedBranchId('');
    setRoleName('');
    setMaxWeeklyHours(40);
    setPriorityOrder(1);
    setShiftTypes(['morning', 'evening']);
    setAvailableDays([0, 1, 2, 3, 4, 5, 6]);
    setIsAddingNew(false);
    setEditingId(null);
  };

  // Load assignment for editing
  const startEditing = (assignment: BranchAssignment) => {
    setSelectedBranchId(assignment.branch_id);
    setRoleName(assignment.role_name);
    setMaxWeeklyHours(assignment.max_weekly_hours || 40);
    setPriorityOrder(assignment.priority_order);
    setShiftTypes(assignment.shift_types || ['morning', 'evening']);
    setAvailableDays(assignment.available_days || [0, 1, 2, 3, 4, 5, 6]);
    setEditingId(assignment.id);
    setIsAddingNew(false);
  };

  // Create or update assignment
  const saveAssignmentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBranchId || !roleName) {
        throw new Error('יש למלא את כל השדות הנדרשים');
      }

      const assignmentData = {
        employee_id: employeeId,
        branch_id: selectedBranchId,
        role_name: roleName,
        max_weekly_hours: maxWeeklyHours,
        priority_order: priorityOrder,
        shift_types: shiftTypes,
        available_days: availableDays,
        is_active: true
      };

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('employee_branch_assignments')
          .update(assignmentData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('employee_branch_assignments')
          .insert(assignmentData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-branch-assignments', employeeId] });
      toast({
        title: 'הצלחה',
        description: editingId ? 'השיוך עודכן בהצלחה' : 'השיוך נוסף בהצלחה',
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'אירעה שגיאה בשמירת השיוך',
        variant: 'destructive',
      });
    },
  });

  // Delete assignment
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('employee_branch_assignments')
        .delete()
        .eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-branch-assignments', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'השיוך נמחק בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את השיוך',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'ראשון';
      case 2: return 'שני';
      case 3: return 'שלישי';
      default: return `${priority}`;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      setShiftTypes([...shiftTypes, shiftType]);
    } else {
      setShiftTypes(shiftTypes.filter(type => type !== shiftType));
    }
  };

  const handleDayChange = (day: number, checked: boolean) => {
    if (checked) {
      setAvailableDays([...availableDays, day].sort());
    } else {
      setAvailableDays(availableDays.filter(d => d !== day));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          שיוכי סניפים ומשמרות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing assignments */}
        {assignments.length > 0 && (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{assignment.branch?.name}</div>
                    <div className="text-sm text-gray-500">
                      תפקיד: {assignment.role_name}
                      {assignment.max_weekly_hours && ` • עד ${assignment.max_weekly_hours} שעות שבועיות`}
                    </div>
                    <div className="text-xs text-gray-400 space-y-1 mt-1">
                      <div>סוגי משמרות: {getShiftTypeLabel(assignment.shift_types || [])}</div>
                      <div>ימים זמינים: {getDayLabels(assignment.available_days || [])}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(assignment.priority_order)}>
                    עדיפות {getPriorityLabel(assignment.priority_order)}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(assignment)}
                    disabled={isAddingNew || editingId === assignment.id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                    disabled={deleteAssignmentMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit form */}
        {(isAddingNew || editingId) && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <h4 className="font-medium">
              {editingId ? 'עריכת שיוך סניף' : 'הוספת שיוך סניף חדש'}
            </h4>

            {/* Branch selection */}
            <div>
              <Label htmlFor="branch">סניף</Label>
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סניף" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role selection */}
            <div>
              <Label htmlFor="role">תפקיד</Label>
              <Select value={roleName} onValueChange={setRoleName}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר תפקיד" />
                </SelectTrigger>
                <SelectContent>
                  {existingRoles.length > 0 ? (
                    existingRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="קופאי">קופאי</SelectItem>
                      <SelectItem value="מכירות">מכירות</SelectItem>
                      <SelectItem value="מנהל">מנהל</SelectItem>
                      <SelectItem value="אבטחה">אבטחה</SelectItem>
                      <SelectItem value="ניקיון">ניקיון</SelectItem>
                      <SelectItem value="טבח">טבח</SelectItem>
                      <SelectItem value="מלצר">מלצר</SelectItem>
                      <SelectItem value="נהג">נהג</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Hours and priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours">מקסימום שעות שבועיות</Label>
                <Input
                  id="hours"
                  type="number"
                  min="1"
                  max="60"
                  value={maxWeeklyHours}
                  onChange={(e) => setMaxWeeklyHours(parseInt(e.target.value) || 40)}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="priority">עדיפות</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={priorityOrder}
                  onChange={(e) => setPriorityOrder(parseInt(e.target.value) || 1)}
                  className="text-right"
                />
              </div>
            </div>

            {/* Shift types */}
            <div>
              <Label>סוגי משמרות</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="form-morning"
                    checked={shiftTypes.includes('morning')}
                    onCheckedChange={(checked) => handleShiftTypeChange('morning', checked as boolean)}
                  />
                  <Label htmlFor="form-morning">בוקר</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="form-evening"
                    checked={shiftTypes.includes('evening')}
                    onCheckedChange={(checked) => handleShiftTypeChange('evening', checked as boolean)}
                  />
                  <Label htmlFor="form-evening">ערב</Label>
                </div>
              </div>
            </div>

            {/* Available days */}
            <div>
              <Label>ימים זמינים</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`form-day-${index}`}
                      checked={availableDays.includes(index)}
                      onCheckedChange={(checked) => handleDayChange(index, checked as boolean)}
                    />
                    <Label htmlFor={`form-day-${index}`} className="text-sm">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => saveAssignmentMutation.mutate()}
                disabled={saveAssignmentMutation.isPending || !selectedBranchId || !roleName}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'עדכן' : 'הוסף'}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={saveAssignmentMutation.isPending}
              >
                ביטול
              </Button>
            </div>
          </div>
        )}

        {/* Add button */}
        {!isAddingNew && !editingId && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            הוסף שיוך חדש
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
