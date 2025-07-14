
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShiftRequest {
  id: number;
  employee_id: string;
  business_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  notes?: string;
  manager_notes?: string;
  employee?: {
    full_name: string;
    phone?: string;
  };
}

export const ShiftApprovalDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [managerNotes, setManagerNotes] = useState<{ [id: number]: string }>({});
  const { toast } = useToast();

  // Real data will come from database
  useEffect(() => {
    setRequests([]);
    setLoading(false);
  }, []);

  const updateStatus = async (id: number, newStatus: 'approved' | 'rejected') => {
    try {
      // In real implementation, this would be a Supabase call
      setRequests(prev => prev.map(r => 
        r.id === id 
          ? { ...r, status: newStatus, manager_notes: managerNotes[id] || '' }
          : r
      ));

      toast({
        title: 'הסטטוס עודכן',
        description: `הבקשה ${newStatus === 'approved' ? 'אושרה' : 'נדחתה'} בהצלחה`,
      });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את הסטטוס',
        variant: 'destructive',
      });
    }
  };

  const sendWhatsApp = (phone: string, employeeName: string, status: string, date: string, managerNote?: string) => {
    const statusText = status === 'approved' ? 'אושרה' : status === 'rejected' ? 'נדחתה' : 'ממתינה לטיפול';
    const message = `שלום ${employeeName}, הבקשה שלך למשמרת בתאריך ${date} ${statusText}.${managerNote ? `\nהערת מנהל: ${managerNote}` : ''}`;
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.employee?.full_name?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">מאושר</Badge>;
      case 'rejected':
        return <Badge variant="destructive">נדחה</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ממתין</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">אישור בקשות משמרת</h1>
        <p className="text-gray-600 mt-2">ניהול ואישור בקשות משמרת מעובדים</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>חיפוש וסינון</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="חיפוש לפי שם עובד..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="pending">ממתין לאישור</option>
                <option value="approved">מאושר</option>
                <option value="rejected">נדחה</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>בקשות משמרת ({filteredRequests.length})</CardTitle>
          <CardDescription>
            כל הבקשות הנוכחיות עם אפשרות לאישור או דחייה
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              אין בקשות משמרת להצגה
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="font-semibold">{request.employee?.full_name}</h3>
                        <p className="text-sm text-gray-500">
                          {request.date} | {request.start_time} - {request.end_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      <span className="text-xs text-gray-400">
                        נשלח {new Date(request.submitted_at).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>הערת עובד:</strong> {request.notes}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        הערת מנהל
                      </label>
                      <Textarea
                        placeholder="הוסף הערה למשמרת זו..."
                        value={managerNotes[request.id] || request.manager_notes || ''}
                        onChange={(e) => setManagerNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                        className="resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        פעולות
                      </label>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => updateStatus(request.id, 'approved')}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              אשר
                            </Button>
                            <Button
                              onClick={() => updateStatus(request.id, 'rejected')}
                              variant="destructive"
                              className="flex-1"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              דחה
                            </Button>
                          </>
                        )}
                        {request.employee?.phone && (
                          <Button
                            onClick={() => sendWhatsApp(
                              request.employee!.phone!,
                              request.employee!.full_name,
                              request.status,
                              request.date,
                              managerNotes[request.id] || request.manager_notes
                            )}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            שלח בוואטסאפ
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
