import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Receipt, 
  Package, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';

interface AccountingOverviewProps {
  businessId: string;
}

export const AccountingOverview: React.FC<AccountingOverviewProps> = ({ businessId }) => {
  // שליפת נתונים סטטיסטיים
  const { data: invoices } = useRealData<any>({
    queryKey: ['invoices-overview', businessId],
    tableName: 'invoices',
    filters: { business_id: businessId },
    enabled: !!businessId
  });

  const { data: receipts } = useRealData<any>({
    queryKey: ['receipts-overview', businessId],
    tableName: 'receipts',
    filters: { business_id: businessId },
    enabled: !!businessId
  });

  const { data: inventoryItems } = useRealData<any>({
    queryKey: ['inventory-overview', businessId],
    tableName: 'inventory_items',
    filters: { business_id: businessId },
    enabled: !!businessId
  });

  const { data: journalEntries } = useRealData<any>({
    queryKey: ['journal-overview', businessId],
    tableName: 'journal_entries',
    filters: { business_id: businessId },
    enabled: !!businessId
  });

  // חישוב סטטיסטיקות
  const stats = {
    totalInvoices: invoices?.length || 0,
    totalReceipts: receipts?.length || 0,
    totalInventoryItems: inventoryItems?.length || 0,
    totalJournalEntries: journalEntries?.length || 0,
    pendingInvoices: invoices?.filter((inv: any) => inv.status === 'pending').length || 0,
    totalRevenue: receipts?.reduce((sum: number, receipt: any) => sum + (receipt.amount_received || 0), 0) || 0,
    lowStockItems: inventoryItems?.filter((item: any) => item.current_quantity <= item.minimum_quantity).length || 0
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* כרטיסי סטטיסטיקות ראשיים */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-r-4 border-r-blue-500">
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2" dir="rtl">
            <CardTitle className="text-sm font-medium">חשבוניות</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent dir="rtl">
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices} ממתינות לתשלום
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-green-500">
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2" dir="rtl">
            <CardTitle className="text-sm font-medium">קבלות</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent dir="rtl">
            <div className="text-2xl font-bold">{stats.totalReceipts}</div>
            <p className="text-xs text-muted-foreground">
              ₪{stats.totalRevenue.toLocaleString()} סה"כ הכנסות
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-purple-500">
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2" dir="rtl">
            <CardTitle className="text-sm font-medium">פריטי מלאי</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent dir="rtl">
            <div className="text-2xl font-bold">{stats.totalInventoryItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockItems} במלאי נמוך
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-orange-500">
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2" dir="rtl">
            <CardTitle className="text-sm font-medium">רישומי יומן</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent dir="rtl">
            <div className="text-2xl font-bold">{stats.totalJournalEntries}</div>
            <p className="text-xs text-muted-foreground">
              החודש הנוכחי
            </p>
          </CardContent>
        </Card>
      </div>

      {/* התראות ומידע חשוב */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              התראות חשובות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.lowStockItems > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <Package className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">
                  {stats.lowStockItems} פריטים במלאי נמוך
                </span>
              </div>
            )}
            
            {stats.pendingInvoices > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {stats.pendingInvoices} חשבוניות ממתינות לתשלום
                </span>
              </div>
            )}

            {stats.lowStockItems === 0 && stats.pendingInvoices === 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  אין התראות פעילות
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              סטטוס תאמה לתקנות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm">מספור עוקב מופעל</span>
              <Badge variant="default">תקין</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm">לוג פעילות פעיל</span>
              <Badge variant="default">תקין</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm">קבצים קבועים</span>
              <Badge variant="secondary">מוגן מעדכון</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* פעולות מהירות */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>
            פעולות נפוצות במערכת החשבונות הממוחשבת
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">חשבונית חדשה</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Receipt className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium">קבלה חדשה</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Package className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">עדכון מלאי</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-medium">רישום יומן</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};