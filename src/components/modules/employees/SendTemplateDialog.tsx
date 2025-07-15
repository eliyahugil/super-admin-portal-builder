import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useEmployeesOptions } from './hooks/useEmployeesOptions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, User } from 'lucide-react';

interface SendTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    document_name: string;
    file_url: string;
    document_type: string;
  };
}

export const SendTemplateDialog: React.FC<SendTemplateDialogProps> = ({
  open,
  onOpenChange,
  template,
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const employees = useEmployeesOptions();

  // מוטציה לשליחת התבנית לעובדים
  const sendTemplateMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      const { data: user } = await supabase.auth.getUser();
      
      const documents = employeeIds.map(employeeId => ({
        employee_id: employeeId,
        document_name: template.document_name,
        document_type: template.document_type,
        file_url: template.file_url,
        uploaded_by: user.user?.id,
        status: 'pending',
        is_template: false, // זה מסמך לחתימה, לא תבנית
        assignee_id: employeeId,
        reminder_count: 0,
      }));

      const { data, error } = await supabase
        .from('employee_documents')
        .insert(documents)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
      toast({
        title: 'התבנית נשלחה בהצלחה',
        description: `המסמך נשלח ל-${data.length} עובדים לחתימה`,
      });
      onOpenChange(false);
      setSelectedEmployees([]);
      setSelectAll(false);
    },
    onError: (error) => {
      console.error('Error sending template:', error);
      toast({
        title: 'שגיאה בשליחת התבנית',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    },
  });

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployees(employees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSend = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: 'לא נבחרו עובדים',
        description: 'אנא בחר לפחות עובד אחד',
        variant: 'destructive',
      });
      return;
    }

    sendTemplateMutation.mutate(selectedEmployees);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>שלח תבנית לעובדים</DialogTitle>
          <p className="text-sm text-gray-600">
            שלח את התבנית "{template.document_name}" לעובדים לחתימה
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* כפתור בחירת הכל */}
          <div className="flex items-center space-x-2 space-x-reverse p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              בחר את כל העובדים ({employees.length})
            </label>
          </div>

          {/* רשימת עובדים */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {employees.map((employee) => (
              <Card key={employee.id} className="border">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={employee.id}
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={(checked) =>
                        handleEmployeeToggle(employee.id, checked as boolean)
                      }
                    />
                    <User className="h-4 w-4 text-gray-500" />
                    <label htmlFor={employee.id} className="text-sm font-medium flex-1">
                      {employee.label}
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>אין עובדים זמינים</p>
            </div>
          )}

          {/* סיכום בחירה */}
          {selectedEmployees.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                נבחרו {selectedEmployees.length} עובדים לשליחת המסמך
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sendTemplateMutation.isPending}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedEmployees.length === 0 || sendTemplateMutation.isPending}
            className="flex items-center gap-2"
          >
            {sendTemplateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                שולח...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                שלח לחתימה
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};