
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  User,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

interface ShiftRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  branch_preference?: string;
  role_preference?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  employee?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

interface ShiftRequestCardProps {
  request: ShiftRequest;
  showActions?: boolean;
  reviewNotes: { [id: string]: string };
  onReviewNotesChange: (requestId: string, notes: string) => void;
  onUpdateStatus: (requestId: string, status: 'approved' | 'rejected', notes?: string) => void;
  onSendWhatsApp: (phone: string, employeeName: string, status: string, date: string, notes?: string) => void;
  isUpdating?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'ממתין לאישור';
    case 'approved': return 'מאושר';
    case 'rejected': return 'נדחה';
    default: return status;
  }
};

export const ShiftRequestCard: React.FC<ShiftRequestCardProps> = ({
  request,
  showActions = false,
  reviewNotes,
  onReviewNotesChange,
  onUpdateStatus,
  onSendWhatsApp,
  isUpdating = false
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">{request.employee_name}</span>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {getStatusLabel(request.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <strong>תאריך:</strong>
            <p>{format(new Date(request.shift_date), 'dd/MM/yyyy')}</p>
          </div>
          <div>
            <strong>שעות:</strong>
            <p>{request.start_time} - {request.end_time}</p>
          </div>
          {request.branch_preference && (
            <div>
              <strong>סניף מועדף:</strong>
              <p className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {request.branch_preference}
              </p>
            </div>
          )}
          {request.role_preference && (
            <div>
              <strong>תפקיד מועדף:</strong>
              <p>{request.role_preference}</p>
            </div>
          )}
        </div>

        {request.notes && (
          <div className="mb-4">
            <strong>הערות העובד:</strong>
            <p className="text-gray-700">{request.notes}</p>
          </div>
        )}

        {request.review_notes && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <strong>הערת מנהל:</strong>
            <p className="text-gray-700 mt-1">{request.review_notes}</p>
          </div>
        )}

        <div className="text-sm text-gray-500 mb-3">
          <Calendar className="inline h-4 w-4 mr-1" />
          נוצר: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
          {request.reviewed_at && (
            <span className="mr-4">
              | נבדק: {format(new Date(request.reviewed_at), 'dd/MM/yyyy HH:mm')}
            </span>
          )}
        </div>

        {showActions && request.status === 'pending' && (
          <div className="border-t pt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">הערת מנהל:</label>
              <Textarea
                placeholder="הוסף הערה (אופציונלי)..."
                value={reviewNotes[request.id] || ''}
                onChange={(e) => onReviewNotesChange(request.id, e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(request.id, 'approved', reviewNotes[request.id])}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                אשר
              </Button>
              
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onUpdateStatus(request.id, 'rejected', reviewNotes[request.id])}
                disabled={isUpdating}
              >
                <XCircle className="h-4 w-4 mr-1" />
                דחה
              </Button>
              
              {request.employee?.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendWhatsApp(
                    request.employee!.phone!,
                    request.employee_name!,
                    request.status,
                    format(new Date(request.shift_date), 'dd/MM/yyyy'),
                    reviewNotes[request.id]
                  )}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  וואטסאפ
                </Button>
              )}
            </div>
          </div>
        )}

        {request.status !== 'pending' && request.employee?.phone && (
          <div className="border-t pt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSendWhatsApp(
                request.employee!.phone!,
                request.employee_name!,
                request.status,
                format(new Date(request.shift_date), 'dd/MM/yyyy'),
                request.review_notes
              )}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              שלח עדכון בוואטסאפ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
