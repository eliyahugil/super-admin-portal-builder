import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserX, UserCheck, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Employee } from '@/types/employee';

interface EmployeeToggleActiveButtonProps {
  employee: Employee;
  onSuccess?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

export const EmployeeToggleActiveButton: React.FC<EmployeeToggleActiveButtonProps> = ({
  employee,
  onSuccess,
  variant = 'outline',
  size = 'sm'
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isActive = employee.is_active;
  const statusText = isActive ? 'פעיל' : 'לא פעיל';
  const action = isActive ? 'כיבוי' : 'הפעלה';
  const futureStatus = isActive ? 'לא פעיל' : 'פעיל';

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id);

      if (error) {
        console.error('Error toggling employee active status:', error);
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה בעת שינוי סטטוס העובד',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: `העובד ${employee.first_name} ${employee.last_name} ${!isActive ? 'הופעל' : 'כובה'} בהצלחה`,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error in toggle active:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעת שינוי סטטוס העובד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={loading}
          className={isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : isActive ? (
            <UserX className="h-4 w-4 mr-2" />
          ) : (
            <UserCheck className="h-4 w-4 mr-2" />
          )}
          {statusText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action} עובד - {employee.first_name} {employee.last_name}
          </AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך {action === 'כיבוי' ? 'לכבות' : 'להפעיל'} את העובד{' '}
            <strong>{employee.first_name} {employee.last_name}</strong>?
            <br />
            <br />
            העובד יהיה <strong>{futureStatus}</strong> במערכת.
            {action === 'כיבוי' && (
              <>
                <br />
                <span className="text-orange-600">
                  עובד לא פעיל לא יוכל להשתתף במשמרות חדשות.
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleToggleActive}
            className={action === 'כיבוי' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {action} עובד
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};