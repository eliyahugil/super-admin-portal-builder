import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

const ADMIN_PASSWORD = '130898';

export const DeleteAllShiftsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();
  
  console.log('🗑️ DeleteAllShiftsButton rendered with businessId:', businessId);

  const handleDelete = async () => {
    if (password !== ADMIN_PASSWORD) {
      setError('סיסמת מנהל שגויה');
      return;
    }

    if (!businessId) {
      setError('לא נמצא עסק פעיל');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      console.log('🗑️ Starting to delete all shifts for business:', businessId);

      // Delete all scheduled shifts for this business
      const { error: shiftsError } = await supabase
        .from('scheduled_shifts')
        .delete()
        .eq('business_id', businessId);

      if (shiftsError) {
        console.error('❌ Error deleting shifts:', shiftsError);
        throw shiftsError;
      }

      // Get active employee IDs for this business first
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (employeesError) {
        console.error('❌ Error fetching employees:', employeesError);
        throw employeesError;
      }

      const employeeIds = employees?.map(emp => emp.id) || [];

      if (employeeIds.length > 0) {
        // Delete all shift requests for employees in this business
        const { error: requestsError } = await supabase
          .from('employee_shift_requests')
          .delete()
          .in('employee_id', employeeIds);

        if (requestsError) {
          console.error('❌ Error deleting shift requests:', requestsError);
          // Continue anyway - this is not critical
        }

        // Delete all employee shift preferences for this business
        const { error: preferencesError } = await supabase
          .from('employee_shift_preferences')
          .delete()
          .in('employee_id', employeeIds);

        if (preferencesError) {
          console.error('❌ Error deleting shift preferences:', preferencesError);
          // Continue anyway - this is not critical
        }

        // Delete all weekly tokens for employees in this business
        const { error: tokensError } = await supabase
          .from('employee_weekly_tokens')
          .delete()
          .in('employee_id', employeeIds);

        if (tokensError) {
          console.error('❌ Error deleting weekly tokens:', tokensError);
          // Continue anyway - this is not critical
        }
      }

      console.log('✅ Successfully deleted all shifts and related data');

      toast({
        title: 'הצלחה',
        description: 'כל המשמרות והנתונים הקשורים נמחקו בהצלחה',
      });

      setOpen(false);
      setPassword('');

    } catch (error) {
      console.error('❌ Error in delete operation:', error);
      setError(error instanceof Error ? error.message : 'שגיאה לא ידועה');
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המשמרות',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setPassword('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          מחק כל המשמרות
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            מחיקת כל המשמרות
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>אזהרה!</strong> פעולה זו תמחק את כל המשמרות, בקשות המשמרות, 
              העדפות המשמרות והטוקנים השבועיים של כל העובדים בעסק זה.
              <br />
              <strong>לא ניתן לבטל פעולה זו!</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              סיסמת מנהל
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="הכנס את סיסמת המנהל"
              disabled={isDeleting}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || !password}
            >
              {isDeleting ? 'מוחק...' : 'מחק הכל'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};