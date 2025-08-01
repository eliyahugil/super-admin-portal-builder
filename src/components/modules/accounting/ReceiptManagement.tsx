import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt, Plus, Search, Eye, Edit } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';

interface ReceiptManagementProps {
  businessId: string;
}

export const ReceiptManagement: React.FC<ReceiptManagementProps> = ({ businessId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: receipts } = useRealData<any>({
    queryKey: ['receipts', businessId],
    tableName: 'receipts',
    filters: { business_id: businessId },
    enabled: !!businessId
  });

  const filteredReceipts = receipts?.filter((receipt: any) => {
    return receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           receipt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ניהול קבלות</h2>
          <p className="text-gray-600">ניהול קבלות בהתאם לתקנות רשות המיסים</p>
        </div>
        <Button className="flex items-center gap-2 flex-row-reverse">
          <Plus className="h-4 w-4" />
          קבלה חדשה
        </Button>
      </div>

      <Card>
        <CardHeader dir="rtl">
          <CardTitle>חיפוש קבלות</CardTitle>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="מספר קבלה או שם לקוח..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader dir="rtl">
          <CardTitle className="flex items-center gap-2 flex-row-reverse">
            <Receipt className="h-5 w-5" />
            קבלות ({filteredReceipts.length})
          </CardTitle>
        </CardHeader>
        <CardContent dir="rtl">
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין קבלות</h3>
              <p className="text-gray-600">טרם נוצרו קבלות במערכת</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-medium">מספר עוקב</th>
                    <th className="text-right py-3 px-4 font-medium">מספר קבלה</th>
                    <th className="text-right py-3 px-4 font-medium">תאריך</th>
                    <th className="text-right py-3 px-4 font-medium">לקוח</th>
                    <th className="text-right py-3 px-4 font-medium">סכום</th>
                    <th className="text-right py-3 px-4 font-medium">אמצעי תשלום</th>
                    <th className="text-right py-3 px-4 font-medium">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((receipt: any) => (
                    <tr key={receipt.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono">#{receipt.sequential_number}</td>
                      <td className="py-3 px-4 text-sm font-medium">{receipt.receipt_number}</td>
                      <td className="py-3 px-4 text-sm">{new Date(receipt.receipt_date).toLocaleDateString('he-IL')}</td>
                      <td className="py-3 px-4 text-sm">{receipt.customer_name}</td>
                      <td className="py-3 px-4 text-sm font-medium">₪{receipt.amount_received?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm">{receipt.payment_method}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
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
    </div>
  );
};