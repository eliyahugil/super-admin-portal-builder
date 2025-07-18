import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { EmployeeBirthDateUpdate } from './EmployeeBirthDateUpdate';
import { Phone, Lock, User, Info } from 'lucide-react';

export const EmployeeLoginFlow: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showBirthDateUpdate, setShowBirthDateUpdate] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  
  const { 
    session, 
    loading, 
    loginWithPhone, 
    completeBirthDateUpdate,
    logout,
    requiresBirthDateUpdate 
  } = useEmployeeAuth();

  // Update the session state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Force a re-render by checking the session
      const stored = localStorage.getItem('employee_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentEmployee(parsed.employee);
        } catch (error) {
          console.error('Failed to parse stored session:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await loginWithPhone(phone, password);
    
    if (result.success && result.requiresBirthDate && result.employee) {
      setCurrentEmployee(result.employee);
      setShowBirthDateUpdate(true);
    } else if (result.success) {
      // Successful login, navigate to employee profile with slight delay to allow session update
      setTimeout(() => {
        if (result.employee?.id) {
          window.location.href = `/modules/employees/profile/${result.employee.id}`;
        } else if (session?.employee?.id) {
          // Fallback to session employee id if available
          window.location.href = `/modules/employees/profile/${session.employee.id}`;
        } else {
          // Force page reload if no employee id available
          window.location.reload();
        }
      }, 100);
    }
  };

  const handleBirthDateComplete = async (updatedEmployee: any) => {
    console.log('✅ Birth date update completed with:', updatedEmployee);
    
    // Update the current employee state with the updated data
    setCurrentEmployee(updatedEmployee);
    setShowBirthDateUpdate(false);
    
    // Navigate to the employee's profile page
    setTimeout(() => {
      window.location.href = `/modules/employees/profile/${updatedEmployee.id}`;
    }, 1000);
  };

  // Show birth date update screen
  if (showBirthDateUpdate && currentEmployee) {
    return (
      <EmployeeBirthDateUpdate
        employeeId={currentEmployee.id}
        employeeName={`${currentEmployee.first_name} ${currentEmployee.last_name}`}
        employeeEmail={currentEmployee.email}
        onComplete={handleBirthDateComplete}
      />
    );
  }

  // Show authenticated state (either from hook session or updated currentEmployee)
  const effectiveSession = session || (currentEmployee && !showBirthDateUpdate ? { employee: currentEmployee, isFirstLogin: false } : null);
  if (effectiveSession && !showBirthDateUpdate) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <User className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-xl text-green-800">מחובר בהצלחה</CardTitle>
          <p className="text-sm text-muted-foreground">
            שלום {effectiveSession.employee.first_name} {effectiveSession.employee.last_name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">פרטי החיבור:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• שם: {effectiveSession.employee.first_name} {effectiveSession.employee.last_name}</li>
              <li>• טלפון: {effectiveSession.employee.phone}</li>
              <li>• מייל: {effectiveSession.employee.email || 'לא הוגדר'}</li>
              <li>• סטטוס: מחובר ופעיל</li>
            </ul>
          </div>
          
          <Button 
            onClick={logout}
            variant="outline" 
            className="w-full"
          >
            התנתק
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
        <CardTitle className="text-xl">התחברות עובדים</CardTitle>
        <p className="text-sm text-muted-foreground">
          התחבר באמצעות מספר טלפון וסיסמה
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              מספר טלפון
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="050-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              dir="ltr"
              className="text-left"
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">
              הכנס מספר בפורמט ישראלי (לדוגמה: 050-1234567)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              סיסמה
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="הזן סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              className="text-left"
              autoComplete="current-password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !phone.trim() || !password.trim()}
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </Button>
        </form>

        {/* Help section */}
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-900 mb-2">הנחיות התחברות:</h4>
                <ul className="text-blue-700 space-y-1">
                  <li><strong>התחברות ראשונה:</strong> השתמש בסיסמה 123456</li>
                  <li><strong>התחברות רגילה:</strong> סיסמה = תאריך לידה בפורמט DDMMYY</li>
                  <li><strong>דוגמה:</strong> נולדת ב-15/03/1990 → סיסמה: 150390</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              בעיות בהתחברות? פנה למנהל המערכת
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};