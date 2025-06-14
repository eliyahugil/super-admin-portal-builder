import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useQuery } from '@tanstack/react-query';

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branches: Array<{ id: string; name: string }>;
}

type EmployeeType = 'permanent' | 'temporary' | 'youth' | 'contractor';
type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day';

async function hashPassword(password: string): Promise<string> {
  if ('crypto' in window && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return password;
}

export const CreateEmployeeDialog: React.FC<CreateEmployeeDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  branches,
}) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    id_number: '',
    email: '',
    phone: '',
    address: '',
    employee_type: 'permanent' as EmployeeType,
    preferred_shift_type: 'morning' as ShiftType,
    weekly_hours_required: 40,
    main_branch_id: '',
    hire_date: '',
    notes: '',
    is_active: true,
    selected_business_id: '',
    // שדות משתמש מערכת
    username: '',
    password: '',
    is_system_user: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  // Get all businesses for super admin selection
  const { data: businesses = [] } = useQuery({
    queryKey: ['all-businesses'],
    queryFn: async () => {
      if (!isSuperAdmin) return [];
      
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching businesses:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: isSuperAdmin && open,
  });

  const effectiveBusinessId = businessId || formData.selected_business_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם פרטי ושם משפחה הם שדות חובה',
        variant: 'destructive',
      });
      return;
    }

    if (!effectiveBusinessId) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור עסק להוספת העובד',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let password_hash = undefined;
      if (formData.password.trim()) {
        password_hash = await hashPassword(formData.password.trim());
      }

      const employeeData = {
        business_id: effectiveBusinessId,
        employee_id: formData.employee_id.trim() || null,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        id_number: formData.id_number.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        employee_type: formData.employee_type,
        preferred_shift_type: formData.preferred_shift_type,
        weekly_hours_required: formData.weekly_hours_required,
        main_branch_id: formData.main_branch_id || null,
        hire_date: formData.hire_date || null,
        notes: formData.notes.trim() || null,
        is_active: formData.is_active,
        username: formData.username.trim() || null,
        password_hash: password_hash || null,
        is_system_user: !!formData.is_system_user,
      };

      // אם לא מולא שם משתמש - אל תכניס סיסמה/סטטוס משתמש מערכת
      if (!formData.username.trim()) {
        employeeData.username = null;
        employeeData.password_hash = null;
        employeeData.is_system_user = false;
      }

      // For display/debug:
      console.log('👤 Creating employee with user fields:', employeeData);

      const { data: createdEmployee, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating employee:', error);
        
        logActivity({
          action: 'create_failed',
          target_type: 'employee',
          target_id: 'unknown',
          details: { 
            employee_name: `${formData.first_name} ${formData.last_name}`,
            error: error.message 
          }
        });

        toast({
          title: 'שגיאה',
          description: `לא ניתן ליצור את העובד: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Employee created successfully:', createdEmployee);

      logActivity({
        action: 'create',
        target_type: 'employee',
        target_id: createdEmployee.id,
        details: { 
          employee_name: `${formData.first_name} ${formData.last_name}`,
          employee_id: formData.employee_id,
          employee_type: formData.employee_type,
          business_id: effectiveBusinessId,
          is_system_user: !!formData.is_system_user,
          username: formData.username || undefined,
          success: true 
        }
      });

      toast({
        title: 'הצלחה! 🎉',
        description: 'העובד נוצר בהצלחה',
      });

      setFormData({
        employee_id: '',
        first_name: '',
        last_name: '',
        id_number: '',
        email: '',
        phone: '',
        address: '',
        employee_type: 'permanent',
        preferred_shift_type: 'morning',
        weekly_hours_required: 40,
        main_branch_id: '',
        hire_date: '',
        notes: '',
        is_active: true,
        selected_business_id: '',
        username: '',
        password: '',
        is_system_user: false,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('💥 Error in handleSubmit:', error);
      
      logActivity({
        action: 'create_failed',
        target_type: 'employee',
        target_id: 'unknown',
        details: { 
          employee_name: `${formData.first_name} ${formData.last_name}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הוסף עובד חדש</DialogTitle>
        </DialogHeader>

        {isSuperAdmin && !businessId && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              כסופר אדמין, עליך לבחור עסק להוספת העובד
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business selection for super admin */}
          {isSuperAdmin && !businessId && (
            <div>
              <Label htmlFor="selected_business_id">בחר עסק *</Label>
              <Select
                value={formData.selected_business_id}
                onValueChange={(value) => setFormData({ ...formData, selected_business_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר עסק" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">שם פרטי *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="הזן שם פרטי"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">שם משפחה *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="הזן שם משפחה"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_id">מספר עובד</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="הזן מספר עובד"
              />
            </div>
            <div>
              <Label htmlFor="id_number">תעודת זהות</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                placeholder="הזן תעודת זהות"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="הזן אימייל"
              />
            </div>
            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="הזן מספר טלפון"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="הזן כתובת"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_type">סוג עובד</Label>
              <Select
                value={formData.employee_type}
                onValueChange={(value: EmployeeType) => setFormData({ ...formData, employee_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">קבוע</SelectItem>
                  <SelectItem value="temporary">זמני</SelectItem>
                  <SelectItem value="youth">נוער</SelectItem>
                  <SelectItem value="contractor">קבלן</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preferred_shift_type">סוג משמרת מועדף</Label>
              <Select
                value={formData.preferred_shift_type}
                onValueChange={(value: ShiftType) => setFormData({ ...formData, preferred_shift_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">בוקר</SelectItem>
                  <SelectItem value="afternoon">צהריים</SelectItem>
                  <SelectItem value="evening">ערב</SelectItem>
                  <SelectItem value="night">לילה</SelectItem>
                  <SelectItem value="full_day">יום מלא</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weekly_hours_required">שעות שבועיות נדרשות</Label>
              <Input
                id="weekly_hours_required"
                type="number"
                min="0"
                max="168"
                value={formData.weekly_hours_required}
                onChange={(e) => setFormData({ ...formData, weekly_hours_required: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="main_branch_id">סניף ראשי</Label>
              <Select
                value={formData.main_branch_id}
                onValueChange={(value) => setFormData({ ...formData, main_branch_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סניף" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="hire_date">תאריך תחילת עבודה</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הזן הערות נוספות"
              rows={3}
            />
          </div>

          {/* --- שדות משתמש מערכת --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">שם משתמש למערכת</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="ליצירת גישת מערכת"
                className="text-right"
              />
            </div>
            <div>
              <Label htmlFor="password">סיסמה</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="סיסמה למשתמש"
                  autoComplete="new-password"
                  className="text-right"
                  disabled={!formData.username}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="px-2 rounded border text-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="הצגת סיסמה"
                >
                  {showPassword ? "🔒" : "👁"}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                יש להזין שם משתמש וסיסמה כדי ליצור גישת מערכת.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Label htmlFor="is_system_user">משתמש מערכת</Label>
            <input
              id="is_system_user"
              type="checkbox"
              checked={!!formData.is_system_user}
              onChange={(e) => setFormData({ ...formData, is_system_user: e.target.checked })}
              disabled={!formData.username}
            />
            <span className="text-xs text-gray-500">(סימון זה יאפשר לעובד גישה לאפליקציה)</span>
          </div>

          {/* טוגל פעיל, כפתורים וכו' */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">עובד פעיל</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (!effectiveBusinessId)}
            >
              {loading ? 'יוצר...' : 'צור עובד'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
