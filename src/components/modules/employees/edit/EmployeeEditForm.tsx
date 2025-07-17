import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AddressAutocomplete, AddressData } from '@/components/ui/AddressAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { useBranchesData } from '@/hooks/useBranchesData';
import { useQuery } from '@tanstack/react-query';
import type { EmployeeType } from '@/types/employee';

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  employee_type: EmployeeType;
  is_active: boolean;
  hire_date: string;
  weekly_hours_required: number;
  notes: string;
  main_branch_id: string;
  username?: string;
  password?: string;
  is_system_user?: boolean;
  termination_date?: string | null;
}

interface EmployeeEditFormProps {
  formData: EmployeeFormData;
  setFormData: (data: EmployeeFormData) => void;
}

export const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  formData,
  setFormData,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [existingRoles, setExistingRoles] = useState<string[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number>(40);
  const [priorityOrder, setPriorityOrder] = useState<number>(1);
  const [shiftTypes, setShiftTypes] = useState<string[]>(['morning', 'evening']);
  const [availableDays, setAvailableDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // Get branches for the current business
  const { data: branches = [] } = useBranchesData(formData.main_branch_id ? 
    // Extract business_id from employee data if available 
    undefined : undefined);

  // Get existing branch assignments for this employee
  const { data: branchAssignments = [] } = useQuery({
    queryKey: ['employee-branch-assignments', formData],
    queryFn: async () => {
      // We'll need the employee ID from somewhere - this needs to be passed down
      return [];
    },
    enabled: false // Disable for now until we have proper employee ID
  });

  // Fetch existing roles from the system
  useEffect(() => {
    const fetchExistingRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_branch_assignments')
          .select('role_name')
          .not('role_name', 'is', null);

        if (error) throw error;

        const uniqueRoles = [...new Set(
          data
            .map(item => item.role_name?.trim())
            .filter(role => role && role.length > 0)
        )];

        setExistingRoles(uniqueRoles);
      } catch (error) {
        console.error('Error fetching existing roles:', error);
        setExistingRoles(['קופאי', 'מכירות', 'מנהל', 'אבטחה', 'ניקיון', 'טבח', 'מלצר', 'נהג']);
      }
    };

    fetchExistingRoles();
  }, []);

  const handleAddressChange = (addressData: AddressData | null) => {
    setFormData({
      ...formData,
      address: addressData?.formatted_address || ''
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">שם פרטי</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            className="text-right"
          />
        </div>
        <div>
          <Label htmlFor="last_name">שם משפחה</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            className="text-right"
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
            className="text-right"
          />
        </div>
        <div>
          <Label htmlFor="phone">טלפון</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="text-right"
          />
        </div>
      </div>

      <div>
        <AddressAutocomplete
          label="כתובת העובד"
          placeholder="חפש כתובת..."
          value={formData.address ? {
            formatted_address: formData.address,
            street: '',
            city: '',
            postalCode: '',
            country: 'Israel',
            latitude: 0,
            longitude: 0,
          } : null}
          onChange={handleAddressChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employee_type">סוג עובד</Label>
          <Select
            value={formData.employee_type || "permanent"}
            onValueChange={(value: EmployeeType) => setFormData({ ...formData, employee_type: value })}
          >
            <SelectTrigger className="text-right">
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
          <Label htmlFor="hire_date">תאריך התחלה</Label>
          <Input
            id="hire_date"
            type="date"
            value={formData.hire_date}
            readOnly
            className="text-right bg-gray-100 pointer-events-none"
            tabIndex={-1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="termination_date">תאריך סיום</Label>
          <Input
            id="termination_date"
            type="date"
            value={formData.termination_date || ''}
            onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
            className="text-right"
            min={formData.hire_date || undefined}
          />
          <div className="text-xs text-gray-500 mt-1">
            אם תציין תאריך סיום בעבר - העובד יעבור אוטומטית לארכיון.
          </div>
        </div>
        <div>
          <Label htmlFor="weekly_hours_required">שעות שבועיות נדרשות</Label>
          <Input
            id="weekly_hours_required"
            type="number"
            value={formData.weekly_hours_required}
            onChange={(e) => setFormData({ ...formData, weekly_hours_required: parseInt(e.target.value) || 0 })}
            className="text-right"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">הערות</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="text-right"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">שם משתמש למערכת</Label>
          <Input
            id="username"
            value={formData.username || ''}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="ליצירת גישת מערכת"
            className="text-right"
          />
        </div>
        <div>
          <Label htmlFor="password">סיסמה חדשה</Label>
          <div className="flex gap-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="הזנת סיסמה תעשה עדכון"
              autoComplete="new-password"
              className="text-right"
            />
            <button
              type="button"
              tabIndex={-1}
              className="px-2 rounded border text-xs"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="הצג סיסמה"
            >
              {showPassword ? "🔒" : "👁"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 justify-end">
        <Label htmlFor="is_system_user">משתמש מערכת</Label>
        <input
          id="is_system_user"
          type="checkbox"
          checked={!!formData.is_system_user}
          onChange={(e) => setFormData({ ...formData, is_system_user: e.target.checked })}
        />
        <Label htmlFor="is_active">עובד פעיל</Label>
        <input
          id="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
      </div>

      {/* Branch Assignments Section */}
      <Separator className="my-6" />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">שיוכי סניפים ומשמרות</h3>
        
        {/* Branch Selection */}
        <div>
          <Label htmlFor="branch">סניף</Label>
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger>
              <SelectValue placeholder="בחר סניף לשיוך" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Selection */}
        <div>
          <Label htmlFor="role">תפקיד</Label>
          <Select value={roleName} onValueChange={setRoleName}>
            <SelectTrigger>
              <SelectValue placeholder="בחר תפקיד" />
            </SelectTrigger>
            <SelectContent>
              {existingRoles.length > 0 ? (
                existingRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="קופאי">קופאי</SelectItem>
                  <SelectItem value="מכירות">מכירות</SelectItem>
                  <SelectItem value="מנהל">מנהל</SelectItem>
                  <SelectItem value="אבטחה">אבטחה</SelectItem>
                  <SelectItem value="ניקיון">ניקיון</SelectItem>
                  <SelectItem value="טבח">טבח</SelectItem>
                  <SelectItem value="מלצר">מלצר</SelectItem>
                  <SelectItem value="נהג">נהג</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Working Hours and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="branch_hours">מקסימום שעות שבועיות</Label>
            <Input
              id="branch_hours"
              type="number"
              min="1"
              max="60"
              value={maxWeeklyHours}
              onChange={(e) => setMaxWeeklyHours(parseInt(e.target.value) || 40)}
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="priority">עדיפות</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={priorityOrder}
              onChange={(e) => setPriorityOrder(parseInt(e.target.value) || 1)}
              className="text-right"
            />
            <p className="text-xs text-gray-500 mt-1">
              1 = עדיפות גבוהה, 10 = עדיפות נמוכה
            </p>
          </div>
        </div>

        {/* Shift Types */}
        <div>
          <Label>סוגי משמרות</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-morning"
                checked={shiftTypes.includes('morning')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShiftTypes([...shiftTypes, 'morning']);
                  } else {
                    setShiftTypes(shiftTypes.filter(type => type !== 'morning'));
                  }
                }}
              />
              <Label htmlFor="edit-morning">בוקר</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-evening"
                checked={shiftTypes.includes('evening')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShiftTypes([...shiftTypes, 'evening']);
                  } else {
                    setShiftTypes(shiftTypes.filter(type => type !== 'evening'));
                  }
                }}
              />
              <Label htmlFor="edit-evening">ערב</Label>
            </div>
          </div>
        </div>

        {/* Available Days */}
        <div>
          <Label>ימים זמינים</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`edit-day-${index}`}
                  checked={availableDays.includes(index)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAvailableDays([...availableDays, index].sort());
                    } else {
                      setAvailableDays(availableDays.filter(d => d !== index));
                    }
                  }}
                />
                <Label htmlFor={`edit-day-${index}`} className="text-sm">{day}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
