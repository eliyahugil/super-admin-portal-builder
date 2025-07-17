
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeBranchAssignmentsProps {
  employeeId: string;
}

export const EmployeeBranchAssignments: React.FC<EmployeeBranchAssignmentsProps> = ({ employeeId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
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
      return data;
    },
    enabled: !!employeeId,
  });

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
          שיוכי סניפים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignments && assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium">{assignment.branch?.name}</div>
                  <div className="text-sm text-gray-500">
                    תפקיד: {assignment.role_name}
                    {assignment.max_weekly_hours && ` • עד ${assignment.max_weekly_hours} שעות שבועיות`}
                  </div>
                  <div className="text-xs text-gray-400 space-y-1 mt-1">
                    <div>סוגי משמרות: {getShiftTypeLabel(assignment.shift_types)}</div>
                    <div>ימים זמינים: {getDayLabels(assignment.available_days)}</div>
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
                  onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                  disabled={deleteAssignmentMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>לא הוגדרו שיוכי סניפים</p>
          </div>
        )}
        
        <Button variant="outline" className="w-full" onClick={() => {
          toast({
            title: 'בקרוב',
            description: 'תכונת הוספת שיוך חדש תוגדר בקרוב',
          });
        }}>
          <Plus className="h-4 w-4 mr-2" />
          הוסף שיוך חדש
        </Button>
      </CardContent>
    </Card>
  );
};
