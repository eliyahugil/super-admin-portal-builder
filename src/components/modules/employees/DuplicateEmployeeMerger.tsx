
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, AlertTriangle, CheckCircle, Merge } from 'lucide-react';
import { useDuplicateEmployees } from './hooks/useDuplicateEmployees';
import type { Employee } from '@/types/employee';

interface DuplicateGroup {
  employees: Employee[];
  reason: string;
  similarity: number;
}

interface EmployeeMergeData {
  primaryEmployeeId: string;
  duplicateEmployeeIds: string[];
  mergedData: Partial<Employee>;
}

export const DuplicateEmployeeMerger: React.FC = () => {
  const { duplicateGroups, isLoading, mergeEmployees, isSubmitting } = useDuplicateEmployees();
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set());
  const [mergeConfirmOpen, setMergeConfirmOpen] = useState(false);
  const [selectedMergeData, setSelectedMergeData] = useState<EmployeeMergeData[]>([]);

  const handleGroupSelection = (groupIndex: number, checked: boolean) => {
    const newSelected = new Set(selectedGroups);
    if (checked) {
      newSelected.add(groupIndex);
    } else {
      newSelected.delete(groupIndex);
    }
    setSelectedGroups(newSelected);
  };

  const prepareMergeData = (): EmployeeMergeData[] => {
    const mergeData: EmployeeMergeData[] = [];
    
    selectedGroups.forEach(groupIndex => {
      const group = duplicateGroups[groupIndex];
      if (group && group.employees.length >= 2) {
        // Select the employee with the most complete data as primary
        const primaryEmployee = group.employees.reduce((best, current) => {
          const bestScore = getCompletenessScore(best);
          const currentScore = getCompletenessScore(current);
          return currentScore > bestScore ? current : best;
        });

        const duplicates = group.employees.filter(emp => emp.id !== primaryEmployee.id);

        // Merge data from all duplicates
        const mergedData = mergeDuplicateData([primaryEmployee, ...duplicates]);

        mergeData.push({
          primaryEmployeeId: primaryEmployee.id,
          duplicateEmployeeIds: duplicates.map(emp => emp.id),
          mergedData
        });
      }
    });

    return mergeData;
  };

  const getCompletenessScore = (employee: Employee): number => {
    let score = 0;
    if (employee.email) score += 1;
    if (employee.phone) score += 1;
    if (employee.address) score += 1;
    if (employee.employee_id) score += 1;
    if (employee.hire_date) score += 1;
    if (employee.notes) score += 1;
    if (employee.main_branch_id) score += 1;
    return score;
  };

  const mergeDuplicateData = (employees: Employee[]): Partial<Employee> => {
    const primary = employees[0];
    const merged: Partial<Employee> = { ...primary };

    employees.forEach(emp => {
      // Take the most complete data for each field
      if (!merged.email && emp.email) merged.email = emp.email;
      if (!merged.phone && emp.phone) merged.phone = emp.phone;
      if (!merged.address && emp.address) merged.address = emp.address;
      if (!merged.employee_id && emp.employee_id) merged.employee_id = emp.employee_id;
      if (!merged.hire_date && emp.hire_date) merged.hire_date = emp.hire_date;
      if (!merged.main_branch_id && emp.main_branch_id) merged.main_branch_id = emp.main_branch_id;
      
      // Merge notes
      if (emp.notes && emp.notes !== merged.notes) {
        merged.notes = merged.notes 
          ? `${merged.notes}\n\n--- מוזג מעובד כפול ---\n${emp.notes}`
          : emp.notes;
      }
    });

    return merged;
  };

  const handleMergeConfirm = async () => {
    const mergeData = prepareMergeData();
    setSelectedMergeData(mergeData);
    setMergeConfirmOpen(true);
  };

  const executeMerge = async () => {
    try {
      await mergeEmployees(selectedMergeData);
      setSelectedGroups(new Set());
      setMergeConfirmOpen(false);
      setSelectedMergeData([]);
    } catch (error) {
      console.error('Error merging employees:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>מחפש עובדים כפולים...</p>
        </CardContent>
      </Card>
    );
  }

  if (duplicateGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            לא נמצאו עובדים כפולים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">כל העובדים במערכת הם ייחודיים.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            עובדים כפולים שנמצאו ({duplicateGroups.length} קבוצות)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              נמצאו עובדים שעלולים להיות כפולים. בחר את הקבוצות שברצונך למזג.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {duplicateGroups.map((group, index) => (
          <Card key={index} className="border-orange-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedGroups.has(index)}
                    onCheckedChange={(checked) => handleGroupSelection(index, checked as boolean)}
                  />
                  <div>
                    <h3 className="font-medium">קבוצה {index + 1}</h3>
                    <p className="text-sm text-gray-600">{group.reason}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  דמיון: {Math.round(group.similarity * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.employees.map((employee) => (
                  <div key={employee.id} className="p-3 border rounded-lg bg-gray-50">
                    <h4 className="font-medium">{employee.first_name} {employee.last_name}</h4>
                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                      {employee.email && <div>📧 {employee.email}</div>}
                      {employee.phone && <div>📱 {employee.phone}</div>}
                      {employee.employee_id && <div>🆔 {employee.employee_id}</div>}
                      {employee.hire_date && <div>📅 {new Date(employee.hire_date).toLocaleDateString('he-IL')}</div>}
                    </div>
                    <div className="mt-2">
                      <Badge variant={employee.is_active ? "default" : "secondary"} className="text-xs">
                        {employee.is_active ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGroups.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">נבחרו {selectedGroups.size} קבוצות למיזוג</p>
                <p className="text-sm text-gray-600">סה"כ {Array.from(selectedGroups).reduce((sum, index) => sum + duplicateGroups[index].employees.length, 0)} עובדים יושפעו</p>
              </div>
              <Button onClick={handleMergeConfirm} className="flex items-center gap-2">
                <Merge className="h-4 w-4" />
                מזג עובדים נבחרים
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={mergeConfirmOpen} onOpenChange={setMergeConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>אישור מיזוג עובדים</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                פעולת המיזוג הינה בלתי הפיכה! העובדים הכפולים יימחקו והנתונים יומזגו לעובד הראשי.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-medium">פרטי המיזוג:</h4>
              {selectedMergeData.map((mergeData, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <p className="text-sm">
                    <strong>עובד ראשי:</strong> {mergeData.primaryEmployeeId}
                  </p>
                  <p className="text-sm">
                    <strong>עובדים כפולים שיימחקו:</strong> {mergeData.duplicateEmployeeIds.length}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMergeConfirmOpen(false)}>
                ביטול
              </Button>
              <Button 
                onClick={executeMerge} 
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? 'מבצע מיזוג...' : 'אשר מיזוג'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
