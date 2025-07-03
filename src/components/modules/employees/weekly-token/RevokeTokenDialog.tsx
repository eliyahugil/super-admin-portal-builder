
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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

interface RevokeTokenDialogProps {
  employeeName: string;
  revoking: boolean;
  compact?: boolean;
  onRevokeToken: () => void;
}

export const RevokeTokenDialog: React.FC<RevokeTokenDialogProps> = ({
  employeeName,
  revoking,
  compact = false,
  onRevokeToken,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="בטל טוקן"
          disabled={revoking}
        >
          <X className="h-4 w-4" />
          {!compact && 'בטל טוקן'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>בטל טוקן</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך לבטל את הטוקן של {employeeName}?
            <br />
            פעולה זו תמנע מהעובד להגיש משמרות עם הטוקן הנוכחי.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          <AlertDialogAction
            onClick={onRevokeToken}
            className="bg-red-600 hover:bg-red-700"
            disabled={revoking}
          >
            {revoking ? 'מבטל...' : 'בטל טוקן'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
