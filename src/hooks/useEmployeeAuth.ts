import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  business_id: string;
  birth_date: string | null;
  is_first_login: boolean;
  email?: string | null;
}

interface EmployeeSession {
  employee: Employee;
  isFirstLogin: boolean;
}

export const useEmployeeAuth = () => {
  const [session, setSession] = useState<EmployeeSession | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem('employee_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSession(parsed);
      } catch (error) {
        console.error('Failed to parse stored session:', error);
        localStorage.removeItem('employee_session');
      }
    }
  }, []);

  // Generate password from birth date (DDMMYY format)
  const generatePasswordFromBirthDate = (birthDate: string): string => {
    const date = new Date(birthDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}${month}${year}`;
  };

  // Login with phone and password
  const loginWithPhone = async (phone: string, password: string): Promise<{ success: boolean; requiresBirthDate?: boolean; employee?: Employee }> => {
    setLoading(true);
    
    try {
      console.log('🔐 Attempting employee login with phone:', phone);

      // Find employee by phone - with detailed logging
      console.log('📞 Searching for phone:', phone, 'type:', typeof phone);
      
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('phone', phone)
        .eq('is_active', true)
        .eq('is_archived', false)
        .maybeSingle();

      console.log('🔍 Query result:', { employee, error, dataType: typeof employee });

      if (error) {
        console.error('❌ Database error:', error);
        toast({
          title: 'שגיאה במסד הנתונים',
          description: error.message,
          variant: 'destructive',
        });
        return { success: false };
      }

      if (!employee) {
        console.error('❌ Employee not found for phone:', phone);
        
        // Let's try a broader search to debug
        const { data: allEmployees } = await supabase
          .from('employees')
          .select('phone, first_name, last_name, is_active, is_archived')
          .like('phone', `%${phone.slice(-7)}%`);
          
        console.log('🔍 Similar phones found:', allEmployees);
        
        toast({
          title: 'מספר טלפון לא נמצא',
          description: 'מספר הטלפון לא רשום במערכת',
          variant: 'destructive',
        });
        return { success: false };
      }

      // Check if it's first login (default password: 123456)
      if (employee.is_first_login) {
      if (password === '123456') {
        console.log('✅ First login successful, requires birth date update');
        
        // Generate permanent token if employee doesn't have one (for first login too)
        try {
          const { data: existingToken } = await supabase
            .from('employee_permanent_tokens')
            .select('token')
            .eq('employee_id', employee.id)
            .eq('is_active', true)
            .maybeSingle();

          if (!existingToken) {
            console.log('🔑 Creating permanent token for new employee:', employee.id);
            await supabase.rpc('generate_employee_permanent_token', {
              p_employee_id: employee.id
            });
          }
        } catch (error) {
          console.error('Error creating permanent token:', error);
          // Don't fail login if token creation fails
        }
        
        const employeeSession: EmployeeSession = {
          employee,
          isFirstLogin: true
        };
        setSession(employeeSession);
        localStorage.setItem('employee_session', JSON.stringify(employeeSession));
        
        return { 
          success: true, 
          requiresBirthDate: true,
          employee 
        };
      } else {
          toast({
            title: 'סיסמה שגויה',
            description: 'עבור התחברות ראשונה השתמש בסיסמה: 123456',
            variant: 'destructive',
          });
          return { success: false };
        }
      }

      // Check birth date based password
      if (!employee.birth_date) {
        console.error('❌ Employee has no birth date but is not first login');
        toast({
          title: 'שגיאה במערכת',
          description: 'פנה למנהל המערכת',
          variant: 'destructive',
        });
        return { success: false };
      }

      const expectedPassword = generatePasswordFromBirthDate(employee.birth_date);
      if (password === expectedPassword) {
        console.log('✅ Login successful with birth date password');
        
        // Generate permanent token if employee doesn't have one
        try {
          const { data: existingToken } = await supabase
            .from('employee_permanent_tokens')
            .select('token')
            .eq('employee_id', employee.id)
            .eq('is_active', true)
            .maybeSingle();

          if (!existingToken) {
            console.log('🔑 Creating permanent token for employee:', employee.id);
            await supabase.rpc('generate_employee_permanent_token', {
              p_employee_id: employee.id
            });
          }
        } catch (error) {
          console.error('Error creating permanent token:', error);
          // Don't fail login if token creation fails
        }
        
        const employeeSession: EmployeeSession = {
          employee,
          isFirstLogin: false
        };
        setSession(employeeSession);
        localStorage.setItem('employee_session', JSON.stringify(employeeSession));
        
        toast({
          title: 'התחברות בוצעה בהצלחה',
          description: `ברוך הבא ${employee.first_name} ${employee.last_name}`,
        });
        
        return { success: true, employee };
      } else {
        toast({
          title: 'סיסמה שגויה',
          description: 'הסיסמה צריכה להיות הספרות של תאריך הלידה בפורמט DDMMYY',
          variant: 'destructive',
        });
        return { success: false };
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בהתחברות',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Complete first login by updating birth date and email
  const completeBirthDateUpdate = async (employeeId: string, birthDate: string, email?: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const updateData: any = {
        birth_date: birthDate,
        is_first_login: false,
        updated_at: new Date().toISOString()
      };

      // Add email if provided
      if (email) {
        updateData.email = email;
      }

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employeeId);

      if (error) {
        console.error('❌ Error updating birth date:', error);
        return false;
      }

      // Update session
      if (session) {
        const updatedEmployee = { 
          ...session.employee, 
          birth_date: birthDate, 
          is_first_login: false
        };

        // Add email if provided
        if (email) {
          updatedEmployee.email = email;
        }
        const updatedSession: EmployeeSession = {
          employee: updatedEmployee,
          isFirstLogin: false
        };
        setSession(updatedSession);
        localStorage.setItem('employee_session', JSON.stringify(updatedSession));
      }

      console.log('✅ Birth date updated successfully');
      return true;

    } catch (error) {
      console.error('❌ Error updating birth date:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setSession(null);
    localStorage.removeItem('employee_session');
    console.log('✅ Employee logged out');
  };

  return {
    session,
    loading,
    loginWithPhone,
    completeBirthDateUpdate,
    logout,
    isLoggedIn: !!session,
    requiresBirthDateUpdate: session?.isFirstLogin || false
  };
};