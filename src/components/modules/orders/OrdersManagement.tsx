
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Truck, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';
import { useBusinessSelection } from '@/hooks/useBusinessSelection';
import { BusinessSelector } from '@/components/shared/BusinessSelector';
import { useOrdersData } from './hooks/useOrdersData';
import { CreateOrderDialog } from './CreateOrderDialog';

export const OrdersManagement: React.FC = () => {
  const { isSuperAdmin } = useCurrentBusiness();
  const { profile } = useAuth();
  const { selectedBusinessId, setSelectedBusinessId } = useBusinessSelection();
  const { data: ordersData = [], isLoading, refetch } = useOrdersData(selectedBusinessId);

  console.log('🛒 OrdersManagement - Current state:', {
    selectedBusinessId,
    isSuperAdmin,
    userRole: profile?.role,
    dataCount: ordersData.length
  });

  // Calculate real statistics from data
  const todayOrders = ordersData.length;
  const pendingOrders = ordersData.filter(order => order.status === 'pending').length;
  const processingOrders = ordersData.filter(order => order.status === 'processing').length;
  const deliveredOrders = ordersData.filter(order => order.status === 'delivered').length;

  const stats = [
    { label: 'הזמנות היום', value: todayOrders.toString(), icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'ממתינות למשלוח', value: pendingOrders.toString(), icon: Clock, color: 'text-yellow-600' },
    { label: 'בעיבוד', value: processingOrders.toString(), icon: Truck, color: 'text-orange-600' },
    { label: 'הושלמו', value: deliveredOrders.toString(), icon: MapPin, color: 'text-green-600' },
  ];

  const quickActions = [
    { title: 'ניהול משלוחים', description: 'עקוב אחר סטטוס המשלוחים', link: '/modules/orders/delivery', icon: Truck },
    { title: 'איסוף עצמי', description: 'נהל הזמנות לאיסוף עצמי', link: '/modules/orders/pickup', icon: MapPin },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default">הושלמה</Badge>;
      case 'processing':
        return <Badge variant="secondary">בעיבוד</Badge>;
      case 'pending':
        return <Badge variant="outline">ממתינה</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500">נשלחה</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">בוטלה</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול הזמנות</h1>
            <p className="text-gray-600 mt-2">עקוב ונהל את כל ההזמנות</p>
          </div>
          
          {(selectedBusinessId || !isSuperAdmin) && (
            <CreateOrderDialog onOrderCreated={refetch} />
          )}
        </div>
        
        {isSuperAdmin && (
          <div className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                בחר עסק לצפייה
              </label>
              <BusinessSelector
                selectedBusinessId={selectedBusinessId}
                onBusinessChange={setSelectedBusinessId}
                placeholder="בחר עסק לניהול הזמנות"
                className="max-w-md"
              />
            </div>
            {selectedBusinessId && (
              <Badge variant="outline" className="text-xs">
                מציג נתונים עבור עסק: {selectedBusinessId}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Show content only if business is selected (for super admin) or user has business context */}
      {(selectedBusinessId || !isSuperAdmin) && (
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

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>הזמנות אחרונות</CardTitle>
              <CardDescription>הזמנות מהנתונים</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">טוען נתונים...</div>
              ) : ordersData.length > 0 ? (
                <div className="space-y-4">
                  {ordersData.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">הזמנה #{order.order_number}</p>
                          <p className="text-sm text-gray-500">לקוח: {order.customer_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('he-IL')}
                          </p>
                          <p className="text-sm text-gray-500">
                            סוג: {order.order_type === 'delivery' ? 'משלוח' : 
                                  order.order_type === 'pickup' ? 'איסוף' : 'במקום'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">₪{order.total_amount.toFixed(2)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  אין הזמנות עדיין
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Show business selection prompt for super admin */}
      {isSuperAdmin && !selectedBusinessId && (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">בחר עסק לניהול הזמנות</h2>
          <p className="text-gray-600">יש לבחור עסק ספציפי כדי לצפות בנתוני ההזמנות</p>
        </div>
      )}
    </div>
  );
};
