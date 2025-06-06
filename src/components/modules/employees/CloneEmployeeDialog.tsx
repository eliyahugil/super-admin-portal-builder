
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy } from 'lucide-react';
import type { EmployeeType } from '@/types/supabase';

interface Business {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  employee_type: EmployeeType;
  hire_date?: string | null;
  weekly_hours_required?: number | null;
  notes?: string | null;
  address?: string | null;
  employee_id?: string | null;
}

interface CloneEmployeeDialogProps {
  employee: Employee;
}

export const CloneEmployeeDialog: React.FC<CloneEmployeeDialogProps> = ({ employee }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('is_active', true)
          .neq('id', employee.business_id); // Don't show current business

        if (error) {
          console.error('Error fetching businesses:', error);
          return;
        }

        setBusinesses(data || []);
      } catch (error) {
        console.error('Exception in fetchBusinesses:', error);
      }
    };

    if (open) {
      fetchBusinesses();
    }
  }, [open, employee.business_id]);

  const handleCloneEmployee = async () => {
    if (!selectedBusinessId) {
      toast({
        title: 'שגיאה',
        description: 'נא לבחור עסק',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('=== CLONING EMPLOYEE ===');
      console.log('Source employee:', employee.id);
      console.log('Target business:', selectedBusinessId);

      const newEmployee = {
        business_id: selectedBusinessId,
        first_name: employee.first_name,
        last_name: employee.last_name,
        phone: employee.phone,
        email: employee.email,
        employee_type: employee.employee_type as EmployeeType,
        hire_date: employee.hire_date,
        weekly_hours_required: employee.weekly_hours_required,
        notes: employee.notes ? `שוכפל מעובד מקורי: ${employee.first_name} ${employee.last_name}\n\n${employee.notes}` : `שוכפל מעובד מקורי: ${employee.first_name} ${employee.last_name}`,
        address: employee.address,
        employee_id: employee.employee_id,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('employees')
        .insert(newEmployee)
        .select()
        .single();

      if (error) {
        console.error('Error cloning employee:', error);
        toast({
          title: 'שגיאה',
          description: `שגיאה בשכפול העובד: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('Employee cloned successfully:', data);

      toast({
        title: 'הצלחה',
        description: `העובד ${employee.first_name} ${employee.last_name} שוכפל בהצלחה לעסק החדש!`,
      });

      setSelectedBusinessId('');
      setOpen(false);
    } catch (error) {
      console.error('Exception in handleCloneEmployee:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה לא צפויה בשכפול העובד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          שכפל לעסק אחר
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>שכפל עובד לעסק אחר</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              עובד לשכפול: <span className="font-medium">{employee.first_name} {employee.last_name}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="business-select" className="text-sm font-medium">
              בחר עסק יעד
            </label>
            <Select
              value={selectedBusinessId}
              onValueChange={setSelectedBusinessId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עסק" />
              </SelectTrigger>
              <SelectContent>
                {businesses.length === 0 ? (
                  <SelectItem value="no-businesses" disabled>
                    לא נמצאו עסקים זמינים
                  </SelectItem>
                ) : (
                  businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>מה יישכפל:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>פרטים אישיים (שם, טלפון, מייל)</li>
              <li>סוג עובד ושעות שבועיות</li>
              <li>כתובת והערות</li>
              <li>הערה על המקור המקורי</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleCloneEmployee}
              disabled={!selectedBusinessId || loading || businesses.length === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  משכפל...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  אשר שכפול
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
