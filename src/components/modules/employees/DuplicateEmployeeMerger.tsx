
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Merge, AlertTriangle, Check, X } from 'lucide-react';
import { useDuplicateEmployees } from './hooks/useDuplicateEmployees';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface DuplicateGroup {
  employees: any[];
  reason: string;
  similarity: number;
}

export const DuplicateEmployeeMerger: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set());
  const [showMergeConfirmation, setShowMergeConfirmation] = useState(false);

  const { duplicateGroups, isLoading, mergeEmployees, isSubmitting } = useDuplicateEmployees();

  console.log('🔍 DuplicateEmployeeMerger - State:', {
    businessId,
    duplicateGroupsCount: duplicateGroups.length,
    selectedGroupsCount: selectedGroups.size,
    isLoading,
    isSubmitting
  });

  const handleGroupSelection = (groupIndex: number, selected: boolean) => {
    const newSelected = new Set(selectedGroups);
    if (selected) {
      newSelected.add(groupIndex);
    } else {
      newSelected.delete(groupIndex);
    }
    setSelectedGroups(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedGroups.size === duplicateGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(duplicateGroups.map((_, index) => index)));
    }
  };

  const handleMergeSelected = () => {
    if (selectedGroups.size === 0) return;
    setShowMergeConfirmation(true);
  };

  const confirmMerge = () => {
    const selectedGroupsData = Array.from(selectedGroups).map(index => duplicateGroups[index]);
    
    const mergeDataArray = selectedGroupsData.map(group => {
      // בחר את העובד עם הכי הרבה נתונים כעיקרי
      const primaryEmployee = group.employees.reduce((prev, current) => {
        const prevScore = Object.values(prev).filter(val => val && val !== '').length;
        const currentScore = Object.values(current).filter(val => val && val !== '').length;
        return currentScore > prevScore ? current : prev;
      });

      const duplicateIds = group.employees
        .filter(emp => emp.id !== primaryEmployee.id)
        .map(emp => emp.id);

      // מזג נתונים מכל העובדים
      const mergedData = group.employees.reduce((merged, employee) => {
        Object.keys(employee).forEach(key => {
          if (!merged[key] && employee[key]) {
            merged[key] = employee[key];
          }
        });
        return merged;
      }, { ...primaryEmployee });

      return {
        primaryEmployeeId: primaryEmployee.id,
        duplicateEmployeeIds: duplicateIds,
        mergedData
      };
    });

    mergeEmployees(mergeDataArray);
    setShowMergeConfirmation(false);
    setSelectedGroups(new Set());
  };

  if (!businessId) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              יש לבחור עסק כדי להשתמש בכלי לניהול עובדים כפולים
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>מחפש עובדים כפולים...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ניהול עובדים כפולים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              נמצאו {duplicateGroups.length} קבוצות של עובדים כפולים במערכת
            </p>
            
            {duplicateGroups.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  {selectedGroups.size === duplicateGroups.length ? (
                    <>
                      <X className="h-4 w-4 ml-2" />
                      בטל בחירת הכל
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 ml-2" />
                      בחר הכל ({duplicateGroups.length} קבוצות)
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleMergeSelected}
                  disabled={selectedGroups.size === 0 || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      מבצע מיזוג...
                    </>
                  ) : (
                    <>
                      <Merge className="h-4 w-4 ml-2" />
                      מזג נבחרים ({selectedGroups.size})
                    </>
                  )}
                </Button>

                {selectedGroups.size > 0 && (
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    נבחרו {selectedGroups.size} מתוך {duplicateGroups.length} קבוצות
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* No duplicates found */}
      {duplicateGroups.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">לא נמצאו עובדים כפולים</h3>
              <p className="text-green-600">כל העובדים במערכת הם ייחודיים!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicate groups list */}
      {duplicateGroups.map((group: DuplicateGroup, index: number) => (
        <Card key={index} className={`border-orange-200 transition-all ${selectedGroups.has(index) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedGroups.has(index)}
                  onChange={(e) => handleGroupSelection(index, e.target.checked)}
                  className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                קבוצה כפולה #{index + 1}
                <span className="text-sm text-gray-500">({group.reason})</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  דמיון: {Math.round(group.similarity * 100)}%
                </span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {group.employees.length} עובדים
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.employees.map((employee: any, empIndex: number) => (
                <div key={employee.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                  <span className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </span>
                  {employee.email && (
                    <span className="text-sm text-gray-600">{employee.email}</span>
                  )}
                  {employee.phone && (
                    <span className="text-sm text-gray-600">{employee.phone}</span>
                  )}
                  {employee.employee_id && (
                    <span className="text-sm text-blue-600">מס' עובד: {employee.employee_id}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Confirmation dialog */}
      {showMergeConfirmation && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              אישור מיזוג עובדים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  אתה עומד למזג {selectedGroups.size} קבוצות של עובדים כפולים.
                  <br />
                  פעולה זו תעביר את העובדים הכפולים לארכיון ותמזג את הנתונים לעובד הראשי.
                  <br />
                  <strong>פעולה זו לא ניתנת לביטול!</strong>
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button
                  onClick={confirmMerge}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      מבצע מיזוג...
                    </>
                  ) : (
                    'אישור מיזוג'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowMergeConfirmation(false)}
                  disabled={isSubmitting}
                >
                  ביטול
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
