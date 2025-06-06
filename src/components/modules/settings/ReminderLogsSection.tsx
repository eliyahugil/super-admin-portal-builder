
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Search, Download, RotateCcw, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useShiftReminderLogs } from '@/hooks/useShiftReminderLogs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendShiftTokenWhatsapp } from '@/utils/sendWhatsappReminder';

export const ReminderLogsSection: React.FC = () => {
  const { data: logs = [], isLoading, refetch } = useShiftReminderLogs(200);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // פילטר הנתונים
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const employeeName = `${log.employee?.first_name || ''} ${log.employee?.last_name || ''}`.toLowerCase();
      const phone = log.phone_number || log.employee?.phone || '';
      
      const matchesSearch = searchTerm === '' || 
        employeeName.includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm);
      
      const logDate = log.sent_at ? new Date(log.sent_at).toISOString().split('T')[0] : '';
      const matchesDate = dateFilter === '' || logDate === dateFilter;
      
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || log.method === methodFilter;
      
      return matchesSearch && matchesDate && matchesStatus && matchesMethod;
    });
  }, [logs, searchTerm, dateFilter, statusFilter, methodFilter]);

  // ייצוא לCSV
  const exportToCSV = () => {
    const headers = ['תאריך ושעה', 'שם עובד', 'טלפון', 'אמצעי שליחה', 'סטטוס', 'הודעה'];
    const rows = filteredLogs.map(log => [
      format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm'),
      `${log.employee?.first_name || ''} ${log.employee?.last_name || ''}`.trim(),
      log.phone_number || log.employee?.phone || '',
      log.method === 'manual' ? 'ידני' : 'אוטומטי',
      log.status === 'success' ? 'הצלחה' : 'כשלון',
      log.message_content || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shift_reminder_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'ייצוא הושלם',
      description: 'הקובץ הורד בהצלחה',
    });
  };

  // שליחה מחדש
  const retrySend = async (log: any) => {
    if (!log.employee || !log.phone_number) {
      toast({
        title: 'שגיאה',
        description: 'חסרים פרטי עובד או מספר טלפון',
        variant: 'destructive'
      });
      return;
    }

    try {
      const employeeName = `${log.employee.first_name} ${log.employee.last_name}`;
      const tokenUrl = `${window.location.origin}/weekly-shift-submission/token123`; // נצטרך ליצור טוקן חדש
      
      await sendShiftTokenWhatsapp({
        phone: log.phone_number,
        employeeName,
        employeeId: log.employee_id,
        tokenUrl,
        useAPI: false
      });

      // רישום לוג חדש
      await supabase.from('shift_reminder_logs').insert({
        employee_id: log.employee_id,
        business_id: log.business_id,
        sent_at: new Date().toISOString(),
        method: 'manual',
        status: 'success',
        message_content: `שליחה חוזרת של טוכן משמרות ל${employeeName}`,
        phone_number: log.phone_number
      });

      refetch();

      toast({
        title: 'נשלח בהצלחה',
        description: `הטוכן נשלח מחדש ל${employeeName}`,
      });
    } catch (error) {
      console.error('Error resending:', error);
      toast({
        title: 'שגיאה בשליחה',
        description: 'לא ניתן לשלוח את הטוכן מחדש',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">הצלחה</Badge>;
      case 'failed':
        return <Badge variant="destructive">כשלון</Badge>;
      case 'pending':
        return <Badge variant="secondary">ממתין</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    return method === 'manual' ? 
      <Badge variant="outline">ידני</Badge> : 
      <Badge variant="default">אוטומטי</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            לוג תזכורות משמרות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          לוג תזכורות משמרות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* כלי חיפוש ופילטור */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="חיפוש לפי שם או טלפון"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8"
            />
          </div>
          
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="סינון לפי תאריך"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="success">הצלחה</SelectItem>
              <SelectItem value="failed">כשלון</SelectItem>
              <SelectItem value="pending">ממתין</SelectItem>
            </SelectContent>
          </Select>

          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="אמצעי שליחה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל האמצעים</SelectItem>
              <SelectItem value="manual">ידני</SelectItem>
              <SelectItem value="auto">אוטומטי</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* כפתורי פעולה */}
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            ייצא ל-CSV
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            רענן
          </Button>
          <div className="text-sm text-gray-500 flex items-center">
            <Filter className="h-4 w-4 ml-1" />
            {filteredLogs.length} מתוך {logs.length} רשומות
          </div>
        </div>

        {/* טבלת הנתונים */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תאריך ושעה</TableHead>
                <TableHead>עובד</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>אמצעי</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    אין רשומות להצגה
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {log.employee ? `${log.employee.first_name} ${log.employee.last_name}` : 'לא זמין'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.phone_number || log.employee?.phone || 'לא זמין'}
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(log.method)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell>
                      {log.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retrySend(log)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          נסה שוב
                        </Button>
                      )}
                      {log.error_details && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: 'פרטי שגיאה',
                              description: log.error_details,
                              variant: 'destructive'
                            });
                          }}
                        >
                          📋
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* מידע נוסף */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p>💡 <strong>טיפים:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>ניתן לחפש לפי שם עובד או מספר טלפון</li>
            <li>לחץ על "נסה שוב" כדי לשלוח טוכן מחדש לעובדים שהשליחה נכשלה</li>
            <li>ייצא את הנתונים ל-CSV לניתוח נוסף או דיווח</li>
            <li>השתמש בפילטרים כדי למצוא רשומות ספציפיות</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
