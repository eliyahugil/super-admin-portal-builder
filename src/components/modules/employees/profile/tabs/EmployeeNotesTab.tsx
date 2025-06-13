
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { Employee } from '@/types/supabase';

interface EmployeeNotesTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

export const EmployeeNotesTab: React.FC<EmployeeNotesTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          הערות והתראות
        </CardTitle>
      </CardHeader>
      <CardContent>
        {employee.employee_notes && employee.employee_notes.length > 0 ? (
          <div className="space-y-4">
            {employee.employee_notes.map((note) => (
              <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {note.note_type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(note.created_at).toLocaleDateString('he-IL')}
                  </span>
                </div>
                <p className="text-gray-700">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין הערות</h3>
            <p className="text-gray-500">לא נוספו הערות עבור עובד זה</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
