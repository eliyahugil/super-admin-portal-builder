
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Plus, Eye } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';

export const FinanceManagement: React.FC = () => {
  const { businessId, isSuperAdmin } = useCurrentBusiness();
  const { profile } = useAuth();

  console.log('💰 FinanceManagement - Security parameters:', {
    businessId,
    isSuperAdmin,
    userRole: profile?.role
  });

  // CRITICAL SECURITY: For super admin without selected business, show selection prompt
  if (isSuperAdmin && !businessId) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ניהול כספים</h1>
          <p className="text-gray-600 mb-6">יש לבחור עסק ספציפי לפני גישה למודול הכספים</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 text-sm">
              כמנהל על, עליך לבחור עסק מהרשימה בראש העמוד כדי לצפות במידע הכספי
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If no business context at all
  if (!businessId) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ניהול כספים</h1>
          <p className="text-gray-600">לא נמצא מזהה עסק. אנא פנה למנהל המערכת.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול כספים</h1>
        <p className="text-gray-600 mt-2">מעקב הכנסות, הוצאות ודוחות כספיים</p>
        {isSuperAdmin && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              מציג נתונים עבור עסק: {businessId}
            </Badge>
          </div>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכנסות חודשיות</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪45,231</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" />
              +20.1% מהחודש הקודם
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הוצאות חודשיות</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪12,432</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 text-red-500" />
              +4.3% מהחודש הקודם
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">רווח נקי</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₪32,799</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" />
              +25.2% מהחודש הקודם
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">זרימת מזומנים</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪89,432</div>
            <p className="text-xs text-muted-foreground">
              יתרה נוכחית
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>הכנסות</CardTitle>
            <CardDescription>רישום הכנסות חדשות</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              הוסף הכנסה
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>הוצאות</CardTitle>
            <CardDescription>רישום הוצאות ועלויות</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              הוסף הוצאה
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>דוחות</CardTitle>
            <CardDescription>צפייה בדוחות כספיים</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              צפה בדוחות
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>תנועות אחרונות</CardTitle>
              <CardDescription>תנועות כספיות מהשבוע האחרון</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              צפה בהכל
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    i % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {i % 2 === 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">
                      {i % 2 === 0 ? 'תשלום מלקוח' : 'הוצאה תפעולית'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <span className={`font-bold ${
                    i % 2 === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {i % 2 === 0 ? '+' : '-'}₪{((Math.random() * 5000) + 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
