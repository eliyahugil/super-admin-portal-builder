
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Truck, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrdersManagement: React.FC = () => {
  const stats = [
    { label: 'הזמנות היום', value: '23', icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'ממתינות למשלוח', value: '8', icon: Clock, color: 'text-yellow-600' },
    { label: 'בדרך', value: '15', icon: Truck, color: 'text-orange-600' },
    { label: 'הושלמו', value: '156', icon: MapPin, color: 'text-green-600' },
  ];

  const quickActions = [
    { title: 'ניהול משלוחים', description: 'עקוב אחר סטטוס המשלוחים', link: '/modules/orders/delivery', icon: Truck },
    { title: 'איסוף עצמי', description: 'נהל הזמנות לאיסוף עצמי', link: '/modules/orders/pickup', icon: MapPin },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול הזמנות</h1>
        <p className="text-gray-600 mt-2">עקוב ונהל את כל ההזמנות</p>
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
          <CardDescription>הזמנות מהיום האחרון</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">הזמנה #{1000 + i}</p>
                    <p className="text-sm text-gray-500">לקוח: {['אבי כהן', 'שרה לוי', 'יוסי ישראלי', 'רחל גרין', 'דוד חיים'][i]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">₪{(Math.random() * 500 + 100).toFixed(2)}</span>
                  <Badge variant={i % 3 === 0 ? 'default' : i % 3 === 1 ? 'secondary' : 'outline'}>
                    {i % 3 === 0 ? 'הושלמה' : i % 3 === 1 ? 'בעיבוד' : 'ממתינה'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
