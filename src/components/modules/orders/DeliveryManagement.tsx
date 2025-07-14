
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { Truck, MapPin, Clock, Search, Navigation } from 'lucide-react';

interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  phone: string;
  status: 'pending' | 'in_transit' | 'delivered';
  estimatedTime: string;
  driverName?: string;
}

export const DeliveryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Real data will come from database
  const deliveries: Delivery[] = [];

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>;
      case 'in_transit':
        return <Badge className="bg-blue-100 text-blue-800">בדרך</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">הועבר</Badge>;
    }
  };

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'delivered':
        return <MapPin className="h-5 w-5 text-green-600" />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.orderNumber.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול משלוחים</h1>
        <p className="text-gray-600 mt-2">עקוב אחר סטטוס המשלוחים בזמן אמת</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ממתינים למשלוח</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {deliveries.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">בדרך</p>
                <p className="text-3xl font-bold text-blue-600">
                  {deliveries.filter(d => d.status === 'in_transit').length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">הועברו היום</p>
                <p className="text-3xl font-bold text-green-600">
                  {deliveries.filter(d => d.status === 'delivered').length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>חיפוש ובקרה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="חפש הזמנה או לקוח..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <AddressAutocomplete
              placeholder="חפש לפי כתובת..."
              value={selectedAddress}
              onChange={setSelectedAddress}
            />
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת משלוחים</CardTitle>
          <CardDescription>כל המשלוחים להיום</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {getStatusIcon(delivery.status)}
                  <div>
                    <p className="font-medium">הזמנה #{delivery.orderNumber}</p>
                    <p className="text-sm text-gray-500">{delivery.customerName}</p>
                    <p className="text-sm text-gray-500">{delivery.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">זמן משוער</p>
                    <p className="font-medium">{delivery.estimatedTime}</p>
                  </div>
                  
                  {delivery.driverName && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">נהג</p>
                      <p className="font-medium">{delivery.driverName}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(delivery.status)}
                    {delivery.status === 'pending' && (
                      <Button size="sm" variant="outline">
                        <Truck className="h-4 w-4 mr-1" />
                        שלח
                      </Button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <Button size="sm" variant="outline">
                        <Navigation className="h-4 w-4 mr-1" />
                        מיקום
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDeliveries.length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">לא נמצאו משלוחים</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
