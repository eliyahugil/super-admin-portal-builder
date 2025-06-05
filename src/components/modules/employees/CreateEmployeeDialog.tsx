
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branches: Array<{ id: string; name: string }>;
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
    employee_type: 'permanent',
    preferred_shift_type: 'morning',
    weekly_hours_required: 40,
    main_branch_id: '',
    hire_date: '',
    notes: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    setLoading(true);

    try {
      // Get current user's business_id (assuming super admin for now)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error('Unable to get user profile');
      }

      // For now, we'll use a default business_id - in production this should come from user context
      const businessId = 'default-business-id'; // This should be properly handled

      const employeeData = {
        ...formData,
        business_id: businessId,
        employee_id: formData.employee_id.trim() || null,
        id_number: formData.id_number.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        main_branch_id: formData.main_branch_id || null,
        hire_date: formData.hire_date || null,
        notes: formData.notes.trim() || null,
      };

      const { error } = await supabase
        .from('employees')
        .insert(employeeData);

      if (error) {
        console.error('Error creating employee:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן ליצור את העובד',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'הצלחה',
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
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                onValueChange={(value) => setFormData({ ...formData, employee_type: value })}
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
                onValueChange={(value) => setFormData({ ...formData, preferred_shift_type: value })}
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
            <Button type="submit" disabled={loading}>
              {loading ? 'יוצר...' : 'צור עובד'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
