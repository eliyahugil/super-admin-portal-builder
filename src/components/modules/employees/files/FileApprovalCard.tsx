import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  X, 
  Download, 
  Eye, 
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useFileApproval } from '@/hooks/useFileApproval';

interface FileApprovalCardProps {
  file: {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    approval_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    rejection_reason?: string;
    employee: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
  onView?: () => void;
  onDownload?: () => void;
}

// קומפוננט לאישור קבצים שהעלו עובדים
export const FileApprovalCard: React.FC<FileApprovalCardProps> = ({
  file,
  onView,
  onDownload
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const { approveFile, loading } = useFileApproval();

  const handleApprove = async () => {
    await approveFile(file.id, 'approved');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    await approveFile(file.id, 'rejected', rejectionReason);
    setShowRejectionForm(false);
    setRejectionReason('');
  };

  const getStatusBadge = () => {
    switch (file.approval_status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">מאושר</Badge>;
      case 'rejected':
        return <Badge variant="destructive">נדחה</Badge>;
      default:
        return <Badge variant="secondary">ממתין לאישור</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {file.file_name}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* פרטי קובץ */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{file.employee.first_name} {file.employee.last_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(file.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            גודל קובץ: {formatFileSize(file.file_size)}
          </div>

          {/* סיבת דחייה */}
          {file.approval_status === 'rejected' && file.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>סיבת דחייה:</strong> {file.rejection_reason}
              </p>
            </div>
          )}

          {/* כפתורי פעולה */}
          <div className="flex gap-2 pt-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="h-4 w-4 mr-1" />
                צפייה
              </Button>
            )}
            
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-1" />
                הורדה
              </Button>
            )}

            {file.approval_status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  אישור
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowRejectionForm(true)}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" />
                  דחייה
                </Button>
              </>
            )}
          </div>

          {/* טופס דחייה */}
          {showRejectionForm && (
            <div className="space-y-3 p-3 border rounded-md bg-gray-50">
              <Label htmlFor="rejection-reason">סיבת דחייה</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="הזן סיבת דחייה..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || loading}
                  variant="destructive"
                >
                  אישור דחייה
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowRejectionForm(false);
                    setRejectionReason('');
                  }}
                >
                  ביטול
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};