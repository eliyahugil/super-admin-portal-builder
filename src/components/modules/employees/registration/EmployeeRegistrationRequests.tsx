import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  AlertCircle 
} from 'lucide-react';
import { useEmployeeRegistrationRequests } from '@/hooks/useEmployeeRegistrationRequests';
import { RequestDetailDialog } from './RequestDetailDialog';
import { ApproveRequestDialog } from './ApproveRequestDialog';
import { RejectRequestDialog } from './RejectRequestDialog';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { RegistrationTokenStats } from './RegistrationTokenStats';

export const EmployeeRegistrationRequests: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const {
    requests,
    isLoading,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    approveRequest,
    isApproving,
    rejectRequest,
    isRejecting,
  } = useEmployeeRegistrationRequests();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />ממתין לאישור</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />אושר</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />נדחה</Badge>;
      case 'incomplete':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />לא שלם</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const RequestCard: React.FC<{ request: any }> = ({ request }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => setSelectedRequest(request)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {request.first_name[0]}{request.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {request.first_name} {request.last_name}
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FileText className="h-3 w-3" />
                {request.token?.title || 'טוקן לא זמין'}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getStatusBadge(request.status)}
            <div className="text-xs text-muted-foreground">
              {format(new Date(request.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{request.email}</span>
          </div>
          {request.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{request.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(request.birth_date), 'dd/MM/yyyy', { locale: he })}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{request.id_number}</span>
          </div>
        </div>

        {request.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{request.address}</span>
          </div>
        )}

        {/* העדפות משמרות */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>העדפות משמרות: </span>
          <div className="flex gap-1">
            {request.shift_preferences?.morning && (
              <Badge variant="outline" className="text-xs">בוקר</Badge>
            )}
            {request.shift_preferences?.evening && (
              <Badge variant="outline" className="text-xs">ערב</Badge>
            )}
          </div>
        </div>

        {/* סניפים מועדפים */}
        {request.preferred_branches && request.preferred_branches.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>סניפים מועדפים: {request.preferred_branches.length}</span>
          </div>
        )}

        {request.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRequest(request);
                setShowApproveDialog(true);
              }}
              disabled={isApproving}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              אשר
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRequest(request);
                setShowRejectDialog(true);
              }}
              disabled={isRejecting}
            >
              <XCircle className="h-4 w-4 mr-1" />
              דחה
            </Button>
          </div>
        )}

        {request.status === 'rejected' && request.rejection_reason && (
          <div className="bg-destructive/10 p-2 rounded text-sm">
            <strong>סיבת דחייה:</strong> {request.rejection_reason}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">בקשות הוספת עובדים</h2>
        <p className="text-muted-foreground">
          ניהול וטיפול בבקשות הרישום של עובדים חדשים
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
                <div className="text-sm text-muted-foreground">ממתינות לאישור</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{approvedRequests.length}</div>
                <div className="text-sm text-muted-foreground">אושרו</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{rejectedRequests.length}</div>
                <div className="text-sm text-muted-foreground">נדחו</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{requests.length}</div>
                <div className="text-sm text-muted-foreground">סה"כ בקשות</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            ממתינות ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            אושרו ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            נדחו ({rejectedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            כל הבקשות ({requests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">אין בקשות ממתינות</h3>
              <p className="text-muted-foreground">כל הבקשות טופלו</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4">
            {approvedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid gap-4">
            {rejectedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedRequest && (
        <>
          <RequestDetailDialog
            request={selectedRequest}
            open={!!selectedRequest && !showApproveDialog && !showRejectDialog}
            onOpenChange={(open) => !open && setSelectedRequest(null)}
            onApprove={() => setShowApproveDialog(true)}
            onReject={() => setShowRejectDialog(true)}
          />

          <ApproveRequestDialog
            request={selectedRequest}
            open={showApproveDialog}
            onOpenChange={setShowApproveDialog}
            onApprove={(createEmployee, notes) => {
              approveRequest({
                requestId: selectedRequest.id,
                createEmployee,
                notes
              });
              setShowApproveDialog(false);
              setSelectedRequest(null);
            }}
          />

          <RejectRequestDialog
            request={selectedRequest}
            open={showRejectDialog}
            onOpenChange={setShowRejectDialog}
            onReject={(reason) => {
              rejectRequest({
                requestId: selectedRequest.id,
                rejection_reason: reason
              });
              setShowRejectDialog(false);
              setSelectedRequest(null);
            }}
          />
        </>
      )}
    </div>
  );
};