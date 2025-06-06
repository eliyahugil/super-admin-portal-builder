import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Phone, 
  Building, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Plus
} from 'lucide-react';
import { EmployeeActions } from './EmployeeActions';
import { useNavigate } from 'react-router-dom';

interface Employee {
  id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  employee_type: string;
  is_active: boolean;
  hire_date: string | null;
  weekly_hours_required: number | null;
  notes: string | null;
  main_branch?: { name: string } | null;
  branch_assignments?: Array<{
    branch: { name: string };
    role_name: string;
    is_active: boolean;
  }>;
  weekly_tokens?: Array<{
    token: string;
    week_start_date: string;
    week_end_date: string;
    is_active: boolean;
  }>;
  employee_notes?: Array<{
    content: string;
    note_type: string;
    created_at: string;
  }>;
  salary_info?: {
    hourly_rate?: number;
    monthly_salary?: number;
    currency?: string;
  };
}

export const EmployeesTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { businessId } = useBusiness();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (businessId) {
      fetchEmployees();
    }
  }, [businessId]);

  const fetchEmployees = async () => {
    try {
      console.log('=== FETCHING EMPLOYEES FOR ENHANCED TABLE ===');
      console.log('Business ID:', businessId);
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          phone,
          email,
          employee_type,
          is_active,
          hire_date,
          weekly_hours_required,
          notes,
          main_branch:branches!main_branch_id(name),
          branch_assignments:employee_branch_assignments(
            role_name,
            is_active,
            branch:branches(name)
          ),
          weekly_tokens:employee_weekly_tokens(
            token,
            week_start_date,
            week_end_date,
            is_active
          ),
          employee_notes:employee_notes(
            content,
            note_type,
            created_at
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את רשימת העובדים',
          variant: 'destructive',
        });
        return;
      }

      console.log('Enhanced employees fetched:', data?.length);
      setEmployees(data || []);
    } catch (error) {
      console.error('Exception in fetchEmployees:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בטעינת הנתונים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const searchTerm = search.toLowerCase();
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const employeeId = emp.employee_id?.toLowerCase() || '';
    const phone = emp.phone?.toLowerCase() || '';
    
    const matchesSearch = fullName.includes(searchTerm) || 
                         employeeId.includes(searchTerm) || 
                         phone.includes(searchTerm);
    
    const matchesType = filterType === 'all' || emp.employee_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && emp.is_active) ||
                         (filterStatus === 'inactive' && !emp.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

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

  const getActiveBranches = (employee: Employee) => {
    const activeBranches = employee.branch_assignments?.filter(
      assignment => assignment.is_active
    ) || [];
    
    if (activeBranches.length === 0 && employee.main_branch) {
      return [employee.main_branch.name];
    }
    
    return activeBranches.map(assignment => assignment.branch.name);
  };

  const getActiveRoles = (employee: Employee) => {
    return employee.branch_assignments
      ?.filter(assignment => assignment.is_active)
      ?.map(assignment => assignment.role_name) || [];
  };

  const getActiveToken = (employee: Employee) => {
    const activeToken = employee.weekly_tokens?.find(token => token.is_active);
    return activeToken ? {
      token: activeToken.token,
      period: `${new Date(activeToken.week_start_date).toLocaleDateString('he-IL')} - ${new Date(activeToken.week_end_date).toLocaleDateString('he-IL')}`
    } : null;
  };

  const getRecentNotes = (employee: Employee) => {
    return employee.employee_notes?.slice(0, 2) || [];
  };

  const handleCreateEmployee = () => {
    navigate('/modules/employees/create');
  };

  const handleTokenSent = () => {
    // Refresh data after token is sent
    fetchEmployees();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            טבלת עובדים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            ניהול עובדים ({employees.length})
          </CardTitle>
          <Button onClick={handleCreateEmployee} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            הוסף עובד חדש
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="חיפוש לפי שם, מספר עובד או טלפון..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">כל הסוגים</option>
            <option value="permanent">קבוע</option>
            <option value="temporary">זמני</option>
            <option value="youth">נוער</option>
            <option value="contractor">קבלן</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="inactive">לא פעיל</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredEmployees.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>{search || filterType !== 'all' || filterStatus !== 'all' ? 'לא נמצאו עובדים התואמים לחיפוש' : 'אין עובדים רשומים במערכת'}</p>
            {(!search && filterType === 'all' && filterStatus === 'all') && (
              <Button onClick={handleCreateEmployee} className="mt-4">
                הוסף עובד ראשון
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם מלא</TableHead>
                  <TableHead className="text-right">מספר עובד</TableHead>
                  <TableHead className="text-right">טלפון</TableHead>
                  <TableHead className="text-right">סוג עובד</TableHead>
                  <TableHead className="text-right">סניפים</TableHead>
                  <TableHead className="text-right">תפקידים</TableHead>
                  <TableHead className="text-right">טוקן פעיל</TableHead>
                  <TableHead className="text-right">הערות</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const activeBranches = getActiveBranches(employee);
                  const activeRoles = getActiveRoles(employee);
                  const activeToken = getActiveToken(employee);
                  const recentNotes = getRecentNotes(employee);

                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </div>
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
                        {employee.weekly_hours_required && (
                          <div className="text-xs text-gray-500 mt-1">
                            {employee.weekly_hours_required} שעות/שבוע
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {activeBranches.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {activeBranches.slice(0, 2).map((branchName, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Building className="h-3 w-3 mr-1" />
                                {branchName}
                              </Badge>
                            ))}
                            {activeBranches.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{activeBranches.length - 2} נוספים
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">לא שוייך</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {activeRoles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {activeRoles.slice(0, 2).map((role, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                            {activeRoles.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{activeRoles.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">לא הוגדר</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {activeToken ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-green-600">
                              <Clock className="h-3 w-3" />
                              <span className="font-mono text-xs">
                                {activeToken.token.substring(0, 8)}...
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {activeToken.period}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">לא נוצר</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {recentNotes.length > 0 ? (
                            recentNotes.map((note, index) => (
                              <div key={index} className="text-xs bg-gray-100 rounded px-2 py-1">
                                <span className="font-medium">{note.note_type}:</span>
                                <span className="ml-1">
                                  {note.content.length > 30 
                                    ? `${note.content.substring(0, 30)}...`
                                    : note.content
                                  }
                                </span>
                              </div>
                            ))
                          ) : employee.notes ? (
                            <div className="text-xs text-gray-600">
                              {employee.notes.length > 50 
                                ? `${employee.notes.substring(0, 50)}...`
                                : employee.notes
                              }
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">אין הערות</span>
                          )}
                        </div>
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
                        <EmployeeActions
                          employee={employee}
                          onTokenSent={handleTokenSent}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
