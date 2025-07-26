import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface ScheduleStatusIndicatorProps {
  submission: {
    id: string;
    week_start_date: string;
    week_end_date: string;
    status: string;
    submitted_at: string;
  };
  isSchedulePublished?: boolean;
  publishDate?: string;
}

export const ScheduleStatusIndicator: React.FC<ScheduleStatusIndicatorProps> = ({
  submission,
  isSchedulePublished,
  publishDate
}) => {
  const getStatusContent = () => {
    if (isSchedulePublished) {
      return {
        icon: <CheckCircle className="w-3 h-3 ml-1" />,
        text: 'הסידור פורסם',
        variant: 'default' as const,
        className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
        description: publishDate ? `פורסם ב-${format(new Date(publishDate), 'dd/MM/yyyy HH:mm', { locale: he })}` : undefined
      };
    }

    switch (submission.status) {
      case 'submitted':
        return {
          icon: <Clock className="w-3 h-3 ml-1" />,
          text: 'בהמתנה לאישור',
          variant: 'secondary' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
          description: `הוגש ב-${format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}`
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-3 h-3 ml-1" />,
          text: 'אושר',
          variant: 'default' as const,
          className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
          description: 'הגשת המשמרות אושרה'
        };
      case 'rejected':
        return {
          icon: <AlertTriangle className="w-3 h-3 ml-1" />,
          text: 'נדחה',
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
          description: 'הגשת המשמרות נדחתה'
        };
      default:
        return {
          icon: <Clock className="w-3 h-3 ml-1" />,
          text: submission.status,
          variant: 'outline' as const,
          className: 'border-muted-foreground/20',
          description: undefined
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="flex flex-col gap-1">
      <Badge variant={statusContent.variant} className={statusContent.className}>
        {statusContent.icon}
        {statusContent.text}
      </Badge>
      {statusContent.description && (
        <span className="text-xs text-muted-foreground">
          {statusContent.description}
        </span>
      )}
    </div>
  );
};