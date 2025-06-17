
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';

export const InventoryManagement: React.FC = () => {
  const { businessId, isSuperAdmin } = useCurrentBusiness();
  const { profile } = useAuth();

  console.log('📦 InventoryManagement - Security parameters:', {
    businessId,
    isSuperAdmin,
    userRole: profile?.role
  });

  // CRITICAL SECURITY: For super admin without selected business, show selection prompt
  if (isSuperAdmin && !businessId) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ניהול מלאי</h1>
          <p className="text-gray-600 mb-6">יש לבחור עסק ספציפי לפני גישה למודול המלאי</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 text-sm">
              כמנהל על, עליך לבחור עסק מהרשימה בראש העמוד כדי לצפות במידע המלאי
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
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ניהול מלאי</h1>
          <p className="text-gray-600">לא נמצא מזהה עסק. אנא פנה למנהל המערכת.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'סה"כ מוצרים', value: '245', icon: Package, color: 'text-blue-600' },
    { label: 'מוצרים חסרים', value: '12', icon: AlertTriangle, color: 'text-red-600' },
    { label: 'הכנסות השבוע', value: '89', icon: TrendingUp, color: 'text-green-600' },
    { label: 'יציאות השבוע', value: '156', icon: TrendingDown, color: 'text-orange-600' },
  ];

  const quickActions = [
    { title: 'ניהול מוצרים', description: 'הוסף, ערוך או מחק מוצרים', link: '/modules/inventory/products', icon: Package },
    { title: 'תנועות מלאי', description: 'צפה בהיסטוריית תנועות המלאי', link: '/modules/inventory/stock-movements', icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול מלאי</h1>
        <p className="text-gray-600 mt-2">מעקב ובקרה על מלאי המוצרים</p>
        {isSuperAdmin && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              מציג נתונים עבור עסק: {businessId}
            </Badge>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <action.icon className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
                <Link to={action.link}>
                  <Button variant="outline">
                    צפה
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>פעילות אחרונה</CardTitle>
          <CardDescription>תנועות מלאי מהשבוע האחרון</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">מוצר {i + 1}</p>
                    <p className="text-sm text-gray-500">עודכן לפני {i + 1} שעות</p>
                  </div>
                </div>
                <Badge variant={i % 2 === 0 ? 'default' : 'secondary'}>
                  {i % 2 === 0 ? 'הכנסה' : 'יציאה'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
