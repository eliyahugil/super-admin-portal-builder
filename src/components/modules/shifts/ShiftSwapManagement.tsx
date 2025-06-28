
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  RefreshCw, 
  Plus, 
  Check, 
  X, 
  Clock,
  User,
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShiftSwapRequest {
  id: string;
  requester: string;
  requestedShift: {
    date: string;
    time: string;
    branch: string;
  };
  offeredShift: {
    date: string;
    time: string;
    branch: string;
  };
  targetEmployee?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const ShiftSwapManagement: React.FC = () => {
  const { toast } = useToast();
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([
    {
      id: '1',
      requester: 'יוסי כהן',
      requestedShift: {
        date: '2024-01-15',
        time: '09:00-17:00',
        branch: 'סניף מרכז'
      },
      offeredShift: {
        date: '2024-01-16',
        time: '14:00-22:00',
        branch: 'סניף צפון'
      },
      targetEmployee: 'שרה לוי',
      reason: 'ברית מילה במשפחה',
      status: 'pending',
      created_at: '2024-01-10'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    reason: '',
    targetEmployee: '',
    requestedShiftId: '',
    offeredShiftId: ''
  });

  const handleApproveSwap = (requestId: string) => {
    setSwapRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const }
          : req
      )
    );
    toast({
      title: 'בקשת החלפה אושרה',
      description: 'החלפת המשמרות עודכנה במערכת',
    });
  };

  const handleRejectSwap = (requestId: string) => {
    setSwapRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const }
          : req
      )
    );
    toast({
      title: 'בקשת החלפה נדחתה',
      description: 'הבקשה נדחתה ולא בוצעו שינויים',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'ממתין לאישור', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'אושר', variant: 'default' as const, icon: Check },
      rejected: { label: 'נדחה', variant: 'destructive' as const, icon: X },
    };

    const { label, variant, icon: Icon } = config[status as keyof typeof config];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ניהול החלפת משמרות</h2>
          <p className="text-gray-600">נהל בקשות להחלפת משמרות בין עובדים</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              בקשת החלפה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>בקשת החלפת משמרת</DialogTitle>
              <DialogDescription>
                צור בקשה חדשה להחלפת משמרות בין עובדים
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  עובד מבוקש להחלפה
                </label>
                <Input
                  placeholder="בחר עובד..."
                  value={newRequest.targetEmployee}
                  onChange={(e) => setNewRequest(prev => ({
                    ...prev,
                    targetEmployee: e.target.value
                  }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    משמרת מבוקשת
                  </label>
                  <Input placeholder="בחר משמרת..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    משמרת מוצעת
                  </label>
                  <Input placeholder="בחר משמרת..." />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  סיבת החלפה
                </label>
                <Textarea
                  placeholder="הסבר את הסיבה לבקשת החלפה..."
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  ביטול
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  שלח בקשה
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {swapRequests.map((request) => (
          <Card key={request.id} className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">
                      בקשת החלפה מ{request.requester}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      נוצר בתאריך {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    משמרת מבוקשת להחלפה
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(request.requestedShift.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {request.requestedShift.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.requestedShift.branch}
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    משמרת מוצעת בתמורה
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(request.offeredShift.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {request.offeredShift.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.offeredShift.branch}
                    </div>
                  </div>
                </div>
              </div>
              
              {request.targetEmployee && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>עובד מבוקש:</strong> {request.targetEmployee}
                  </p>
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>סיבת החלפה:</strong> {request.reason}
                </p>
              </div>
              
              {request.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleApproveSwap(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    אשר החלפה
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectSwap(request.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    דחה בקשה
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {swapRequests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              אין בקשות החלפה
            </h3>
            <p className="text-gray-600">
              כל בקשות החלפת המשמרות יופיעו כאן
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
