import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  FileText,
  CreditCard,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Props {
  request: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
}

export const RequestDetailDialog: React.FC<Props> = ({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
}) => {
  if (!request) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">ממתין לאישור</Badge>;
      case 'approved':
        return <Badge variant="default">אושר</Badge>;
      case 'rejected':
        return <Badge variant="destructive">נדחה</Badge>;
      case 'incomplete':
        return <Badge variant="outline">לא שלם</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">
                {request.first_name[0]}{request.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">
                {request.first_name} {request.last_name}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getStatusBadge(request.status)}
                <span>•</span>
                <span>{format(new Date(request.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* פרטים אישיים */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטים אישיים
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">תעודת זהות:</span>
                  <span>{request.id_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">דוא"ל:</span>
                  <span>{request.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">תאריך לידה:</span>
                  <span>{format(new Date(request.birth_date), 'dd/MM/yyyy', { locale: he })}</span>
                </div>
              </div>
              <div className="space-y-2">
                {request.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">טלפון:</span>
                    <span>{request.phone}</span>
                  </div>
                )}
                {request.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">כתובת:</span>
                    <span>{request.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* העדפות משמרות */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              העדפות משמרות
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">סוגי משמרות:</span>
                <div className="flex gap-2">
                  {request.shift_preferences?.morning && (
                    <Badge variant="outline">בוקר</Badge>
                  )}
                  {request.shift_preferences?.evening && (
                    <Badge variant="outline">ערב</Badge>
                  )}
                  {!request.shift_preferences?.morning && !request.shift_preferences?.evening && (
                    <span className="text-muted-foreground">לא צוין</span>
                  )}
                </div>
              </div>

              {request.shift_preferences?.notes && (
                <div>
                  <span className="font-medium">הערות על משמרות:</span>
                  <p className="mt-1 text-sm bg-muted p-3 rounded">
                    {request.shift_preferences.notes}
                  </p>
                </div>
              )}

              {/* ימים לא זמינים */}
              {request.shift_preferences?.unavailable_days && 
               Object.keys(request.shift_preferences.unavailable_days).length > 0 && (
                <div>
                  <span className="font-medium">ימים לא זמינים:</span>
                  <div className="mt-1 space-y-1">
                    {Object.entries(request.shift_preferences.unavailable_days).map(([day, reason]) => (
                      <div key={day} className="text-sm bg-red-50 p-2 rounded">
                        <strong>{day}:</strong> {reason as string}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* סניפים מועדפים */}
          {request.preferred_branches && request.preferred_branches.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  סניפים מועדפים
                </h3>
                <div className="grid gap-2">
                  {request.preferred_branches.map((branch: any, index: number) => (
                    <div key={index} className="bg-muted p-3 rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium">{branch.name || `סניף ${index + 1}`}</div>
                        {branch.address && (
                          <div className="text-sm text-muted-foreground">{branch.address}</div>
                        )}
                      </div>
                      {branch.priority && (
                        <Badge variant="outline">עדיפות {branch.priority}</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {request.branch_assignment_notes && (
                  <div className="mt-3">
                    <span className="font-medium">הערות על סניפים:</span>
                    <p className="mt-1 text-sm bg-muted p-3 rounded">
                      {request.branch_assignment_notes}
                    </p>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* מסמכים */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              מסמכים
            </h3>
            <div className="space-y-3">
              {request.id_document_url ? (
                <div className="bg-muted p-3 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>תעודת זהות</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(request.id_document_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    הורד
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  לא הועלתה תעודת זהות
                </div>
              )}

              {request.additional_documents && request.additional_documents.length > 0 && (
                <div>
                  <span className="text-sm font-medium">מסמכים נוספים:</span>
                  <div className="mt-2 space-y-2">
                    {request.additional_documents.map((doc: any, index: number) => (
                      <div key={index} className="bg-muted p-3 rounded flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{doc.name || `מסמך ${index + 1}`}</span>
                        </div>
                        {doc.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            הורד
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* סטטוס ופעולות */}
          {request.status === 'rejected' && request.rejection_reason && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 text-destructive flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  סיבת דחייה
                </h3>
                <div className="bg-destructive/10 p-3 rounded">
                  {request.rejection_reason}
                </div>
              </div>
            </>
          )}

          {request.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  הערות
                </h3>
                <div className="bg-muted p-3 rounded">
                  {request.notes}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {request.status === 'pending' && (
            <>
              <Separator />
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="destructive"
                  onClick={onReject}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  דחה בקשה
                </Button>
                <Button 
                  onClick={onApprove}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  אשר בקשה
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};