
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';
import { BusinessSelector } from '@/components/shared/BusinessSelector';
import { useInventoryData } from './hooks/useInventoryData';

export const InventoryManagement: React.FC = () => {
  const { isSuperAdmin, businessId } = useCurrentBusiness();
  const { profile } = useAuth();
  const { data: inventoryData = [], isLoading } = useInventoryData(businessId);

  console.log('📦 InventoryManagement - Current state:', {
    businessId,
    isSuperAdmin,
    userRole: profile?.role,
    dataCount: inventoryData.length
  });

  // Calculate real statistics from data
  const totalProducts = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.current_stock <= item.min_stock).length;
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.current_stock * item.price), 0);

  const stats = [
    { label: 'סה"כ מוצרים', value: totalProducts.toString(), icon: Package, color: 'text-blue-600' },
    { label: 'מוצרים חסרים', value: lowStockItems.toString(), icon: AlertTriangle, color: 'text-red-600' },
    { label: 'ערך מלאי', value: `₪${totalValue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'פריטים פעילים', value: totalProducts.toString(), icon: TrendingDown, color: 'text-orange-600' },
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
          <div className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                בחר עסק לצפייה
              </label>
              <BusinessSelector
                placeholder="בחר עסק לניהול מלאי"
                className="max-w-md"
                showAllOption={false}
              />
            </div>
            {businessId && (
              <Badge variant="outline" className="text-xs">
                מציג נתונים עבור עסק: {businessId}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Show content only if business is selected (for super admin) or user has business context */}
      {(businessId || !isSuperAdmin) && (
        <>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          {/* Inventory Items */}
          <Card>
            <CardHeader>
              <CardTitle>פריטי מלאי</CardTitle>
              <CardDescription>רשימת המוצרים במלאי</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">טוען נתונים...</div>
              ) : inventoryData.length > 0 ? (
                <div className="space-y-4">
                  {inventoryData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">קוד: {item.sku} | קטגוריה: {item.category}</p>
                          <p className="text-sm text-gray-500">מיקום: {item.location || 'לא צוין'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">כמות: {item.current_stock}</div>
                        <div className="text-sm text-gray-500">מחיר: ₪{item.price}</div>
                        {item.current_stock <= item.min_stock && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            מלאי נמוך
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  אין פריטי מלאי עדיין
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Show business selection prompt for super admin */}
      {isSuperAdmin && !businessId && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">בחר עסק לניהול מלאי</h2>
          <p className="text-gray-600">יש לבחור עסק ספציפי כדי לצפות בנתוני המלאי</p>
        </div>
      )}
    </div>
  );
};
