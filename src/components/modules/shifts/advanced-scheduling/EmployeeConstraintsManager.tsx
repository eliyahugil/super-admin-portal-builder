import React, { useState } from 'react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface EmployeeConstraint {
  id?: string;
  employee_id: string;
  business_id: string;
  constraint_type: 'vacation' | 'unavailable' | 'preferred_times' | 'max_hours_per_day' | 'max_hours_per_week' | 'min_rest_between_shifts';
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  value_numeric?: number;
  priority: number;
  notes?: string;
  is_active: boolean;
}

const CONSTRAINT_TYPES = [
  { value: 'vacation', label: 'חופשה', icon: Calendar, color: 'bg-blue-500' },
  { value: 'unavailable', label: 'לא זמין', icon: AlertTriangle, color: 'bg-red-500' },
  { value: 'preferred_times', label: 'שעות מועדפות', icon: Clock, color: 'bg-green-500' },
  { value: 'max_hours_per_day', label: 'מקסימום שעות ביום', icon: Clock, color: 'bg-yellow-500' },
  { value: 'max_hours_per_week', label: 'מקסימום שעות בשבוע', icon: Clock, color: 'bg-orange-500' },
  { value: 'min_rest_between_shifts', label: 'מינימום מנוחה בין משמרות', icon: Clock, color: 'bg-purple-500' }
] as const;

const DAYS_OF_WEEK = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
  { value: 6, label: 'שבת' }
] as const;

export const EmployeeConstraintsManager: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [newConstraint, setNewConstraint] = useState<Partial<EmployeeConstraint>>({
    business_id: businessId || '',
    constraint_type: 'vacation',
    priority: 3,
    is_active: true,
    days_of_week: []
  });

  // שליפת אילוצי עובדים
  const { data: constraints = [], isLoading } = useQuery({
    queryKey: ['employee-constraints', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('employee_scheduling_constraints')
        .select(`
          *,
          employees:employee_id(id, first_name, last_name, employee_id)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // שליפת עובדים
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // יצירת אילוץ חדש
  const createConstraintMutation = useMutation({
    mutationFn: async (constraint: Partial<EmployeeConstraint>) => {
      const { error } = await supabase
        .from('employee_scheduling_constraints')
        .insert([constraint as any]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-constraints', businessId] });
      setIsDialogOpen(false);
      setNewConstraint({
        business_id: businessId || '',
        constraint_type: 'vacation',
        priority: 3,
        is_active: true,
        days_of_week: []
      });
      toast({
        title: "אילוץ נוצר בהצלחה",
        description: "האילוץ החדש נוסף למערכת הסידור."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה ביצירת האילוץ",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error creating constraint:', error);
    }
  });

  // מחיקת אילוץ
  const deleteConstraintMutation = useMutation({
    mutationFn: async (constraintId: string) => {
      const { error } = await supabase
        .from('employee_scheduling_constraints')
        .delete()
        .eq('id', constraintId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-constraints', businessId] });
      toast({
        title: "אילוץ נמחק בהצלחה",
        description: "האילוץ הוסר מהמערכת."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקת האילוץ",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error deleting constraint:', error);
    }
  });

  const handleCreateConstraint = () => {
    if (!newConstraint.employee_id) {
      toast({
        title: "שגיאה",
        description: "אנא בחר עובד.",
        variant: "destructive"
      });
      return;
    }

    if (!newConstraint.constraint_type) {
      toast({
        title: "שגיאה",
        description: "אנא בחר סוג אילוץ.",
        variant: "destructive"
      });
      return;
    }

    createConstraintMutation.mutate(newConstraint);
  };

  const handleDeleteConstraint = (constraintId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק אילוץ זה?')) {
      deleteConstraintMutation.mutate(constraintId);
    }
  };

  const handleDayChange = (day: number, checked: boolean) => {
    const currentDays = newConstraint.days_of_week || [];
    if (checked) {
      setNewConstraint(prev => ({
        ...prev,
        days_of_week: [...currentDays, day].sort()
      }));
    } else {
      setNewConstraint(prev => ({
        ...prev,
        days_of_week: currentDays.filter(d => d !== day)
      }));
    }
  };

  const getConstraintTypeData = (type: string) => {
    return CONSTRAINT_TYPES.find(ct => ct.value === type) || CONSTRAINT_TYPES[0];
  };

  const getDaysLabel = (days?: number[]) => {
    if (!days || days.length === 0) return 'כל הימים';
    return days.map(d => DAYS_OF_WEEK.find(dow => dow.value === d)?.label).join(', ');
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'נמוכה';
      case 2: return 'נמוכה-בינונית';
      case 3: return 'בינונית';
      case 4: return 'גבוהה-בינונית';
      case 5: return 'גבוהה';
      default: return 'בינונית';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-gray-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-orange-500';
      case 5: return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  // קיבוץ אילוצים לפי עובד
  const constraintsByEmployee = constraints.reduce((acc, constraint) => {
    const employeeId = constraint.employee_id;
    if (!acc[employeeId]) {
      acc[employeeId] = [];
    }
    acc[employeeId].push(constraint);
    return acc;
  }, {} as Record<string, typeof constraints>);

  if (isLoading) {
    return <div className="flex justify-center p-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* כפתור הוספת אילוץ */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">אילוצים ועדיפויות עובדים</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              הוסף אילוץ חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>יצירת אילוץ חדש</DialogTitle>
              <DialogDescription>
                הוסף אילוץ או העדפה עבור עובד
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>עובד</Label>
                <Select
                  value={newConstraint.employee_id || ''}
                  onValueChange={(value) => setNewConstraint(prev => ({ ...prev, employee_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} ({employee.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>סוג אילוץ</Label>
                <Select
                  value={newConstraint.constraint_type}
                  onValueChange={(value: any) => setNewConstraint(prev => ({ ...prev, constraint_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSTRAINT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>עדיפות (1-5)</Label>
                <Select
                  value={newConstraint.priority?.toString() || '3'}
                  onValueChange={(value) => setNewConstraint(prev => ({ ...prev, priority: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(priority => (
                      <SelectItem key={priority} value={priority.toString()}>
                        {priority} - {getPriorityLabel(priority)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(newConstraint.constraint_type === 'vacation' || 
                newConstraint.constraint_type === 'unavailable') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>תאריך התחלה</Label>
                    <Input
                      type="date"
                      value={newConstraint.start_date || ''}
                      onChange={(e) => setNewConstraint(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>תאריך סיום</Label>
                    <Input
                      type="date"
                      value={newConstraint.end_date || ''}
                      onChange={(e) => setNewConstraint(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {newConstraint.constraint_type === 'preferred_times' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>שעת התחלה מועדפת</Label>
                      <Input
                        type="time"
                        value={newConstraint.start_time || ''}
                        onChange={(e) => setNewConstraint(prev => ({ ...prev, start_time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>שעת סיום מועדפת</Label>
                      <Input
                        type="time"
                        value={newConstraint.end_time || ''}
                        onChange={(e) => setNewConstraint(prev => ({ ...prev, end_time: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>ימים רלוונטיים</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={newConstraint.days_of_week?.includes(day.value) || false}
                            onCheckedChange={(checked) => handleDayChange(day.value, checked as boolean)}
                          />
                          <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(newConstraint.constraint_type === 'max_hours_per_day' || 
                newConstraint.constraint_type === 'max_hours_per_week' ||
                newConstraint.constraint_type === 'min_rest_between_shifts') && (
                <div className="space-y-2">
                  <Label>
                    {newConstraint.constraint_type === 'max_hours_per_day' && 'מקסימום שעות ביום'}
                    {newConstraint.constraint_type === 'max_hours_per_week' && 'מקסימום שעות בשבוע'}
                    {newConstraint.constraint_type === 'min_rest_between_shifts' && 'מינימום שעות מנוחה'}
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={newConstraint.value_numeric || ''}
                    onChange={(e) => setNewConstraint(prev => ({ ...prev, value_numeric: Number(e.target.value) }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>הערות (אופציונלי)</Label>
                <Textarea
                  value={newConstraint.notes || ''}
                  onChange={(e) => setNewConstraint(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הערות נוספות על האילוץ..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ביטול
                </Button>
                <Button onClick={handleCreateConstraint} disabled={createConstraintMutation.isPending}>
                  {createConstraintMutation.isPending ? 'יוצר...' : 'צור אילוץ'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* רשימת אילוצים לפי עובד */}
      <div className="space-y-6">
        {Object.keys(constraintsByEmployee).length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">אין אילוצים מוגדרים</p>
                <p className="text-sm text-muted-foreground">
                  הוסף אילוצים כדי להתאים את הסידור לצרכי העובדים
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(constraintsByEmployee).map(([employeeId, employeeConstraints]) => {
            const employee = employeeConstraints[0]?.employees;
            if (!employee) return null;

            return (
              <Card key={employeeId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    {employee.first_name} {employee.last_name}
                    <Badge variant="outline">
                      {employee.employee_id}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {employeeConstraints.length} אילוצים פעילים
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {employeeConstraints.map((constraint) => {
                      const typeData = getConstraintTypeData(constraint.constraint_type);
                      const TypeIcon = typeData.icon;
                      
                      return (
                        <div key={constraint.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${typeData.color} text-white`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{typeData.label}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                {constraint.start_date && constraint.end_date && (
                                  <div>
                                    {new Date(constraint.start_date).toLocaleDateString('he-IL')} - {new Date(constraint.end_date).toLocaleDateString('he-IL')}
                                  </div>
                                )}
                                {constraint.start_time && constraint.end_time && (
                                  <div>{constraint.start_time} - {constraint.end_time}</div>
                                )}
                                {constraint.days_of_week && constraint.days_of_week.length > 0 && (
                                  <div>ימים: {getDaysLabel(constraint.days_of_week)}</div>
                                )}
                                {constraint.value_numeric && (
                                  <div>ערך: {constraint.value_numeric}</div>
                                )}
                                {constraint.notes && (
                                  <div>הערות: {constraint.notes}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded text-xs text-white ${getPriorityColor(constraint.priority)}`}>
                              עדיפות {constraint.priority}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteConstraint(constraint.id!)}
                              disabled={deleteConstraintMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};