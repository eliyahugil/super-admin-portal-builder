
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Eye } from 'lucide-react';
import { ShiftRequestCard } from './ShiftRequestCard';

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
  employee?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

interface ShiftApprovalTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  filteredRequests: ShiftRequest[];
  reviewNotes: { [id: string]: string };
  onReviewNotesChange: (requestId: string, notes: string) => void;
  onUpdateStatus: (requestId: string, status: 'approved' | 'rejected', notes?: string) => void;
  onSendWhatsApp: (phone: string, employeeName: string, status: string, date: string, notes?: string) => void;
  isUpdating?: boolean;
}

export const ShiftApprovalTabs: React.FC<ShiftApprovalTabsProps> = ({
  activeTab,
  onTabChange,
  filteredRequests,
  reviewNotes,
  onReviewNotesChange,
  onUpdateStatus,
  onSendWhatsApp,
  isUpdating = false
}) => {
  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="approval" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          אישור בקשות
        </TabsTrigger>
        <TabsTrigger value="view" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          צפייה כללית
        </TabsTrigger>
      </TabsList>

      <TabsContent value="approval" className="space-y-4">
        <div className="space-y-4">
          {pendingRequests.map(request => (
            <ShiftRequestCard
              key={request.id}
              request={request}
              showActions={true}
              reviewNotes={reviewNotes}
              onReviewNotesChange={onReviewNotesChange}
              onUpdateStatus={onUpdateStatus}
              onSendWhatsApp={onSendWhatsApp}
              isUpdating={isUpdating}
            />
          ))}
        </div>

        {pendingRequests.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות לאישור</h3>
            <p className="text-gray-600">כל הבקשות כבר נבדקו ואושרו או נדחו</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="view" className="space-y-4">
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <ShiftRequestCard
              key={request.id}
              request={request}
              showActions={false}
              reviewNotes={reviewNotes}
              onReviewNotesChange={onReviewNotesChange}
              onUpdateStatus={onUpdateStatus}
              onSendWhatsApp={onSendWhatsApp}
              isUpdating={isUpdating}
            />
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות משמרות</h3>
            <p className="text-gray-600">לא נמצאו בקשות במערכת</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
