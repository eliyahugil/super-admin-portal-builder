
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Edit, Trash2, Phone, Building, CheckCircle, XCircle, SelectAll } from 'lucide-react';
import { EmployeeEditDialog } from './EmployeeEditDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface Employee {
  id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  employee_type: string;
  is_active: boolean;
  hire_date: string | null;
  weekly_hours_required: number | null;
  main_branch?: { name: string } | null;
}

interface EmployeesListProps {
  employees: Employee[];
  onRefetch: () => void;
}

export const EmployeesList: React.FC<EmployeesListProps> = ({
  employees,
  onRefetch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  console.log('📋 EmployeesList rendering with:', {
    employeesCount: employees.length,
    searchTerm,
    selectedCount: selectedEmployees.size
  });

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const employeeId = employee.employee_id?.toLowerCase() || '';
    const phone = employee.phone?.toLowerCase() || '';
    const email = employee.email?.toLowerCase() || '';

    return (
      fullName.includes(searchLower) ||
      employeeId.includes(searchLower) ||
      phone.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
    console.log('📝 Employee selection changed:', { employeeId, checked, totalSelected: newSelected.size });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredEmployees.map(emp => emp.id));
      setSelectedEmployees(allIds);
      console.log('✅ Selected all employees:', allIds.size);
    } else {
      setSelectedEmployees(new Set());
      console.log('❌ Deselected all employees');
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${employee.first_name} ${employee.last_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id);

      if (error) throw error;

      logActivity({
        action: 'delete',
        target_type: 'employee',
        target_id: employee.id,
        details: { 
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_id: employee.employee_id 
        }
      });

      toast({
        title: 'הצלחה',
        description: 'העובד נמחק בהצלחה',
      });

      // Remove from selected if it was selected
      const newSelected = new Set(selectedEmployees);
      newSelected.delete(employee.id);
      setSelectedEmployees(newSelected);

      onRefetch();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את העובד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) return;

    if (!confirm(`האם אתה בטוח שברצונך למחוק ${selectedEmployees.size} עובדים?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .in('id', Array.from(selectedEmployees));

      if (error) throw error;

      logActivity({
        action: 'bulk_delete',
        target_type: 'employee',
        target_id: 'multiple',
        details: { 
          deleted_count: selectedEmployees.size,
          employee_ids: Array.from(selectedEmployees)
        }
      });

      toast({
        title: 'הצלחה',
        description: `${selectedEmployees.size} עובדים נמחקו בהצלחה`,
      });

      setSelectedEmployees(new Set());
      onRefetch();
    } catch (error) {
      console.error('Error bulk deleting employees:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את העובדים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      youth: 'נוער',
      contractor: 'קבלן',
    };
    return types[type] || type;
  };

  const getEmployeeTypeVariant = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      permanent: 'default',
      temporary: 'secondary',
      youth: 'outline',
      contractor: 'destructive',
    };
    return variants[type] || 'default';
  };

  const allFilteredSelected = filteredEmployees.length > 0 && 
    filteredEmployees.every(emp => selectedEmployees.has(emp.id));
  const someFilteredSelected = filteredEmployees.some(emp => selectedEmployees.has(emp.id));

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="חיפוש לפי שם, מספר עובד, טלפון או אימייל..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        {selectedEmployees.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              נבחרו {selectedEmployees.size} עובדים
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              מחק נבחרים
            </Button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          נמצאו {filteredEmployees.length} תוצאות מתוך {employees.length} עובדים
        </div>
      )}

      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-gray-500">
              {searchTerm ? 'לא נמצאו עובדים התואמים לחיפוש' : 'אין עובדים רשומים'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-right">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={handleSelectAll}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someFilteredSelected && !allFilteredSelected;
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="text-right">שם מלא</TableHead>
                  <TableHead className="text-right">מספר עובד</TableHead>
                  <TableHead className="text-right">טלפון</TableHead>
                  <TableHead className="text-right">סוג עובד</TableHead>
                  <TableHead className="text-right">סניף</TableHead>
                  <TableHead className="text-right">שעות שבועיות</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.has(employee.id)}
                        onCheckedChange={(checked) => 
                          handleSelectEmployee(employee.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div>{employee.first_name} {employee.last_name}</div>
                        {employee.email && (
                          <div className="text-xs text-gray-500 mt-1">
                            {employee.email}
                          </div>
                        )}
                        {employee.hire_date && (
                          <div className="text-xs text-gray-500">
                            התחיל: {new Date(employee.hire_date).toLocaleDateString('he-IL')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.employee_id || (
                        <span className="text-gray-400 text-sm">לא הוגדר</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{employee.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">לא הוגדר</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEmployeeTypeVariant(employee.employee_type)}>
                        {getEmployeeTypeLabel(employee.employee_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.main_branch ? (
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{employee.main_branch.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">לא שוייך</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.weekly_hours_required || (
                        <span className="text-gray-400 text-sm">לא הוגדר</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.is_active ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          פעיל
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          לא פעיל
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEmployee(employee)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee)}
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Employee Dialog */}
      {editingEmployee && (
        <EmployeeEditDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
          onSuccess={() => {
            setEditingEmployee(null);
            onRefetch();
          }}
        />
      )}
    </div>
  );
};
