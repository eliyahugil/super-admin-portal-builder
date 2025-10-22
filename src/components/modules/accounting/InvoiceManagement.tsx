import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceManagementProps {
  businessId: string;
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ businessId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  const { data: invoices } = useRealData<any>({
    queryKey: ['invoices', businessId],
    tableName: 'invoices',
    filters: { business_id: businessId },
    enabled: !!businessId
  });

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesSearch = invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateInvoice = async () => {
    try {
      // Get next sequential number
      const { data: seqData, error: seqError } = await supabase
        .rpc('get_next_sequential_number', {
          table_name_param: 'invoices',
          business_id_param: businessId
        });

      if (seqError) throw seqError;

      const nextNumber = seqData || 1;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNumber).padStart(6, '0')}`;

      // Insert new invoice
      const { error: insertError } = await supabase
        .from('invoices')
        .insert({
          business_id: businessId,
          sequential_number: nextNumber,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          customer_name: 'לקוח חדש',
          subtotal: 0,
          total_amount: 0,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: 'חשבונית נוצרה',
        description: `חשבונית ${invoiceNumber} נוצרה בהצלחה`,
      });
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'לא ניתן ליצור חשבונית',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">ממתין</Badge>;
      case 'paid':
        return <Badge variant="default">שולם</Badge>;
      case 'overdue':
        return <Badge variant="destructive">באיחור</Badge>;
      case 'cancelled':
        return <Badge variant="outline">מבוטל</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* כותרת וכפתור הוספה */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ניהול חשבוניות</h2>
          <p className="text-gray-600">ניהול חשבוניות בהתאם לתקנות רשות המיסים</p>
        </div>
        <Button onClick={handleCreateInvoice} className="flex items-center gap-2 flex-row-reverse">
          <Plus className="h-4 w-4" />
          חשבונית חדשה
        </Button>
      </div>

      {/* פילטרים וחיפוש */}
      <Card>
        <CardHeader dir="rtl">
          <CardTitle className="text-lg">חיפוש וסינון</CardTitle>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">חיפוש</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="מספר חשבונית או שם לקוח..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  dir="rtl"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">סטטוס</Label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="pending">ממתין</option>
                <option value="paid">שולם</option>
                <option value="overdue">באיחור</option>
                <option value="cancelled">מבוטל</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* רשימת חשבוניות */}
      <Card>
        <CardHeader dir="rtl">
          <CardTitle className="flex items-center gap-2 flex-row-reverse">
            <FileText className="h-5 w-5" />
            חשבוניות ({filteredInvoices.length})
          </CardTitle>
          <CardDescription>
            כל החשבוניות מנוהלות עם מספור עוקב לפי תקנות רשות המיסים
          </CardDescription>
        </CardHeader>
        <CardContent dir="rtl">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין חשבוניות</h3>
              <p className="text-gray-600 mb-4">טרם נוצרו חשבוניות במערכת</p>
              <Button onClick={handleCreateInvoice} className="flex items-center gap-2 flex-row-reverse">
                <Plus className="h-4 w-4" />
                צור חשבונית ראשונה
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-medium">מספר עוקב</th>
                    <th className="text-right py-3 px-4 font-medium">מספר חשבונית</th>
                    <th className="text-right py-3 px-4 font-medium">תאריך</th>
                    <th className="text-right py-3 px-4 font-medium">לקוח</th>
                    <th className="text-right py-3 px-4 font-medium">סכום</th>
                    <th className="text-right py-3 px-4 font-medium">סטטוס</th>
                    <th className="text-right py-3 px-4 font-medium">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice: any) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono">
                        #{invoice.sequential_number}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(invoice.invoice_date).toLocaleDateString('he-IL')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {invoice.customer_name}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        ₪{invoice.total_amount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* הערה על תקנות */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6" dir="rtl">
          <div className="flex items-start gap-3 flex-row-reverse">
            <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">
                חשוב: תאמה לתקנות רשות המיסים
              </h4>
              <p className="text-sm text-amber-700">
                כל החשבוניות מנוהלות בספר כרוך דיגיטלי עם מספור עוקב. 
                אין אפשרות למחוק חשבוניות - רק לבטל באמצעות חשבונית סטורנו.
                כל הפעולות נרשמות בלוג הפעילות לפי התקנות.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};