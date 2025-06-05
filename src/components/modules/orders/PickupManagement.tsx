
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Search, Phone, Check } from 'lucide-react';

interface Pickup {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  branch: string;
  status: 'ready' | 'picked_up' | 'cancelled';
  readyTime: string;
  pickupTime?: string;
}

export const PickupManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const pickups: Pickup[] = [
    {
      id: '1',
      orderNumber: '1001',
      customerName: 'אבי כהן',
      phone: '052-1234567',
      branch: 'סניף ראשי - תל אביב',
      status: 'ready',
      readyTime: '14:30',
    },
    {
      id: '2',
      orderNumber: '1002',
      customerName: 'שרה לוי',
      phone: '053-7654321',
      branch: 'סניף רמת גן',
      status: 'picked_up',
      readyTime: '13:00',
      pickupTime: '15:30',
    },
    {
      id: '3',
      orderNumber: '1003',
      customerName: 'יוסי ישראלי',
      phone: '054-9876543',
      branch: 'סניף ראשי - תל אביב',
      status: 'ready',
      readyTime: '16:00',
    },
  ];

  const getStatusBadge = (status: Pickup['status']) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">מוכן לאיסוף</Badge>;
      case 'picked_up':
        return <Badge className="bg-blue-100 text-blue-800">נאסף</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">בוטל</Badge>;
    }
  };

  const getStatusIcon = (status: Pickup['status']) => {
    switch (status) {
      case 'ready':
        return <Clock className="h-5 w-5 text-green-600" />;
      case 'picked_up':
        return <Check className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <MapPin className="h-5 w-5 text-red-600" />;
    }
  };

  const filteredPickups = pickups.filter(pickup =>
    pickup.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.orderNumber.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול איסוף עצמי</h1>
        <p className="text-gray-600 mt-2">נהל הזמנות המיועדות לאיסוף עצמי</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">מוכנות לאיסוף</p>
                <p className="text-3xl font-bold text-green-600">
                  {pickups.filter(p => p.status === 'ready').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">נאספו היום</p>
                <p className="text-3xl font-bold text-blue-600">
                  {pickups.filter(p => p.status === 'picked_up').length}
                </p>
              </div>
              <Check className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">זמן המתנה ממוצע</p>
                <p className="text-3xl font-bold text-orange-600">25 דק'</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>חיפוש הזמנות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש הזמנה או לקוח..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pickups List */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת איסופים</CardTitle>
          <CardDescription>הזמנות לאיסוף עצמי</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPickups.map((pickup) => (
              <div key={pickup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {getStatusIcon(pickup.status)}
                  <div>
                    <p className="font-medium">הזמנה #{pickup.orderNumber}</p>
                    <p className="text-sm text-gray-500">{pickup.customerName}</p>
                    <p className="text-sm text-gray-500">{pickup.branch}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">מוכן מ:</p>
                    <p className="font-medium">{pickup.readyTime}</p>
                  </div>
                  
                  {pickup.pickupTime && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">נאסף ב:</p>
                      <p className="font-medium">{pickup.pickupTime}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(pickup.status)}
                    {pickup.status === 'ready' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          התקשר
                        </Button>
                        <Button size="sm">
                          <Check className="h-4 w-4 mr-1" />
                          נאסף
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPickups.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">לא נמצאו הזמנות לאיסוף</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
