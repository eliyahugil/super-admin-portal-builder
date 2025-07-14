
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TrendingUp, TrendingDown, Calendar as CalendarIcon, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface StockMovement {
  id: string;
  productName: string;
  sku: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: Date;
  user: string;
}

export const StockMovements: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Real data will come from database
  const movements: StockMovement[] = [];

  const getMovementIcon = (type: StockMovement['type']) => {
    return type === 'in' ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-600" />
    );
  };

  const getMovementBadge = (type: StockMovement['type']) => {
    return type === 'in' ? (
      <Badge className="bg-green-100 text-green-800">הכנסה</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">יציאה</Badge>
    );
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || movement.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">תנועות מלאי</h1>
        <p className="text-gray-600 mt-2">מעקב אחר כל תנועות המלאי במערכת</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">הכנסות השבוע</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">יציאות השבוע</p>
                <p className="text-3xl font-bold text-red-600">0</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">איזון נטו</p>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>סינון תנועות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="חפש מוצר..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="סוג תנועה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התנועות</SelectItem>
                <SelectItem value="in">הכנסות</SelectItem>
                <SelectItem value="out">יציאות</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-right">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: he }) : 'בחר תאריך'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              ייצא לאקסל
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>תנועות אחרונות</CardTitle>
          <CardDescription>רשימת כל תנועות המלאי</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {getMovementIcon(movement.type)}
                  <div>
                    <p className="font-medium">{movement.productName}</p>
                    <p className="text-sm text-gray-500">{movement.sku}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">כמות</p>
                    <p className="font-medium">{movement.quantity}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">סיבה</p>
                    <p className="font-medium">{movement.reason}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">תאריך</p>
                    <p className="font-medium">{format(movement.date, 'dd/MM/yyyy')}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">משתמש</p>
                    <p className="font-medium">{movement.user}</p>
                  </div>

                  {getMovementBadge(movement.type)}
                </div>
              </div>
            ))}
          </div>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">לא נמצאו תנועות מלאי</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
